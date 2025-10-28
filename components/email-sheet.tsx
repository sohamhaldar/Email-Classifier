import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Email, ClassifiedEmail, EmailSheetProps } from '@/types'


function EmailSheet({ isOpen, onOpenChange, selectedEmail, formatDate, getCategoryColor }: EmailSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className='font-sans lg:max-w-[60vw] bg-[#0A0A0A] border-neutral-800 text-neutral-200 overflow-y-auto'>
          {selectedEmail && (
            <>
              <SheetHeader className="border-b border-neutral-800 pb-4 mb-4">
                <SheetTitle className="text-xl font-semibold text-neutral-100 pr-8">
                  {selectedEmail.subject || "(No Subject)"}
                </SheetTitle>
                <SheetDescription className="text-neutral-400">
                  <div className="space-y-2 mt-3">
                    <div className="flex items-start gap-3">
                      <span className="text-neutral-500 font-medium min-w-[70px]">From:</span>
                      <span className="text-neutral-300 break-all">{selectedEmail.from}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-neutral-500 font-medium min-w-[70px]">To:</span>
                      <span className="text-neutral-300 break-all">{selectedEmail.to}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-neutral-500 font-medium min-w-[70px]">Date:</span>
                      <span className="text-neutral-300">
                        {formatDate(selectedEmail.date)}
                      </span>
                    </div>
                    {"category" in selectedEmail && (
                      <div className="flex items-start gap-3">
                        <span className="text-neutral-500 font-medium min-w-[70px]">Category:</span>
                        <span className={`text-xs px-3 py-1.5 ${getCategoryColor((selectedEmail as ClassifiedEmail).category)} rounded-md font-medium text-black`}>
                          {(selectedEmail as ClassifiedEmail).category}
                        </span>
                      </div>
                    )}
                  </div>
                </SheetDescription>
              </SheetHeader>
              
              <div className="pb-6 px-16">
                {selectedEmail.htmlBody ? (
                  <div
                    className="email-content bg-white text-black p-8 rounded-lg shadow-lg"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                    style={{
                      maxWidth: '100%',
                      overflowX: 'auto',
                      minHeight: '200px',
                    }}
                  />
                ) : selectedEmail.textBody ? (
                  <div className="bg-neutral-900 rounded-lg border border-neutral-800">
                    <div className="p-8">
                      <pre className="whitespace-pre-wrap font-sans text-neutral-300 leading-relaxed text-sm">
                        {selectedEmail.textBody}
                      </pre>
                    </div>
                  </div>
                ) : selectedEmail.body ? (
                  <div className="bg-neutral-900 rounded-lg border border-neutral-800">
                    <div className="p-8">
                      <pre className="whitespace-pre-wrap font-sans text-neutral-300 leading-relaxed text-sm">
                        {selectedEmail.body}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
                    <p className="text-neutral-400 text-center">
                      {selectedEmail.snippet || "No content available"}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
  )
}

export default EmailSheet