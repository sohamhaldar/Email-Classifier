import { google } from "googleapis";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getClient } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";


function parseEmail(message: any) {
    const headers = message.payload?.headers || [];
    
    const getHeader = (name: string) => {
        const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
        return header?.value || '';
    };
    
    const from = getHeader('From');
    const to = getHeader('To');
    const subject = getHeader('Subject');
    const date = getHeader('Date');
    
    const extractBody = (payload: any): { htmlBody: string; textBody: string } => {
        let htmlBody = '';
        let textBody = '';
        
        if (payload.body?.data) {
            const decodedBody = Buffer.from(payload.body.data, 'base64').toString('utf-8');
            if (payload.mimeType === 'text/html') {
                htmlBody = decodedBody;
            } else if (payload.mimeType === 'text/plain') {
                textBody = decodedBody;
            }
        }
        
        if (payload.parts && Array.isArray(payload.parts)) {
            for (const part of payload.parts) {
                if (part.filename && part.filename.length > 0) {
                    continue;
                }
                
                const extracted = extractBody(part);
                if (extracted.htmlBody) htmlBody = htmlBody || extracted.htmlBody;
                if (extracted.textBody) textBody = textBody || extracted.textBody;
            }
        }
        
        return { htmlBody, textBody };
    };
    
    const { htmlBody, textBody } = extractBody(message.payload);
    const body = textBody || htmlBody;
    
    const bodyPreview = body.replace(/<[^>]*>/g, '').substring(0, 200);
    
    return {
        id: message.id,
        threadId: message.threadId,
        from: from,
        to: to,
        subject: subject,
        date: date,
        snippet: message.snippet,
        body: body,
        htmlBody: htmlBody,
        textBody: textBody,
        bodyPreview: bodyPreview,
        labelIds: message.labelIds || [],
        isUnread: message.labelIds?.includes('UNREAD') || false,
        internalDate: message.internalDate,
    };
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        
        if (!session?.user) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const db = await getClient();
        const accountsCollection = db.collection('account');
        const userIdQuery = typeof session.user.id === 'string' 
            ? new ObjectId(session.user.id)
            : session.user.id;
        
        const account = await accountsCollection.findOne({
            userId: userIdQuery,
            providerId: 'google'
        });

        console.log('Account found:', !!account);

        if (!account) {
            return NextResponse.json({
                success: false,
                message: 'No Google account linked. Please sign in with Google again.',
                debug: {
                    userId: session.user.id,
                    accountFound: false
                }
            }, {
                status: 401
            });
        }
        const accessToken = account.accessToken || account.access_token;
        const refreshToken = account.refreshToken || account.refresh_token;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                message: 'Access token not found in account. Please sign in with Google again.',
                debug: {
                    accountFields: Object.keys(account),
                    hasAccessToken: !!account.accessToken,
                }
            }, {
                status: 401
            });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_AUTH_CLIENT_ID,
            process.env.GOOGLE_AUTH_CLIENT_SECRET
        );
        
        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        
        const { searchParams } = new URL(request.url);
        const maxResults = parseInt(searchParams.get('maxResults') || '15');
        const pageToken = searchParams.get('pageToken') || undefined;
        const query = searchParams.get('query') || undefined;
        
        const listResponse = await gmail.users.messages.list({
            userId: 'me',
            maxResults: maxResults,
            pageToken: pageToken,
            q: query,
        });
        
        const messageIds = listResponse.data.messages || [];
        
        const messages = await Promise.all(
            messageIds.map(async (msg) => {
                const message = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id || '',
                    format: 'full'
                });
                return parseEmail(message.data);
            })
        );
        
        return NextResponse.json({
            success: true,
            emails: messages,
            nextPageToken: listResponse.data.nextPageToken,
            resultSizeEstimate: listResponse.data.resultSizeEstimate
        }, {
            status: 200
        });
    } catch (error: any) {
        console.error('Gmail API Error:', error);
        return NextResponse.json({
            success: false,
            message: 'An error occurred',
            error: error.message
        }, {
            status: 500
        });
    }
}


