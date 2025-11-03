"use client";
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { MailCountSelector } from '@/components/mail-count-selector'
import { InboxOutlined, WarningOutlined, TagOutlined, TeamOutlined, SoundOutlined, StopOutlined, MailOutlined, SettingFilled } from '@ant-design/icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Inbox, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from "sonner"
import { useAuthContext } from '@/context/auth-context'
import { signIn, signOut, useSession } from '@/lib/auth-client'
import { ClassifiedEmail, Email } from '@/types'
import EmailSheet from '@/components/email-sheet'
// import { useRouter } from 'next/navigation'



function Mails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [classified, setClassified] = useState<ClassifiedEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | ClassifiedEmail | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mailCount, setMailCount] = useState(15);
  const [selectedCategory, setSelectedCategory] = useState("All Mail");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  
  const { sessionExpired } = useAuthContext();
  const { data: session } = useSession();
  // const router = useRouter();

  useEffect(() => {
    fetchEmails(mailCount);
    const savedApiKey = localStorage.getItem("api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, [mailCount]);

  useEffect(() => {
    if (session && !sessionExpired) {
      const savedApiKey = localStorage.getItem("api_key");
      if (!savedApiKey) {
        setIsSettingsOpen(true);
        toast.info("Please configure your API key to classify emails");
      }
    }
  }, [session, sessionExpired]);

  const fetchEmails = async (count: number = mailCount) => {
    setLoading(true);
    setClassified([]); 
    try {
      const res = await fetch(`/api/gmail?maxResults=${count}`);
      const data = await res.json();
      console.log("Fetched emails:", data);
      setEmails(data.emails || []);
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  };

  const classifyEmails = async () => {
    if (emails.length === 0) {
      toast.error("No emails to classify");
      return;
    }
    
    const savedApiKey = localStorage.getItem("api_key");
    if (!savedApiKey) {
      toast.error("Please enter your API key in settings");
      setIsSettingsOpen(true);
      return;
    }
    
    setClassifying(true);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          emails,
          apiKey: savedApiKey 
        }),
      });
      
      const data = await res.json();
      console.log("Classification response:", data);
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to classify emails");
      }
      
      
      const classifiedEmails: ClassifiedEmail[] = emails.map((email) => {
        const classification = data.find(
          (c: any) => c.subject === email.subject && c.from === email.from
        );
        return {
          ...email,
          category: classification?.category || "General",
        };
      });
      
      console.log("Classified emails:", classifiedEmails);
      setClassified(classifiedEmails);
      toast.success("Emails classified successfully!");
      return classifiedEmails;
    } catch (error) {
      console.error("Error classifying emails:", error);
      toast.error(error instanceof Error ? error.message : "Failed to classify emails");
      return null;
    } finally {
      setClassifying(false);
    }
  };

  const handleCategoryClick = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    if (categoryName !== "All Mail" && classified.length === 0) {
      await classifyEmails();
    }
  };

  const getFilteredEmails = () => {
    const emailsToShow = classified.length > 0 ? classified : emails;
    
    if (selectedCategory === "All Mail") {
      return emailsToShow;
    }
    if (classified.length > 0) {
      return classified.filter(email => email.category === selectedCategory);
    }
    
    return emailsToShow;
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    localStorage.setItem("api_key", apiKey);
    setIsSettingsOpen(false);
    toast.success("API key saved successfully!");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      // router.push("/landing");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleLogin = async () => {
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/mails",
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to sign in");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("An error occurred during sign-in");
    }
  };

  const handleEmailClick = (email: Email | ClassifiedEmail) => {
    setSelectedEmail(email);
    setIsSheetOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Important': 'bg-red-400',
      'Promotions': 'bg-green-300',
      'Social': 'bg-blue-300',
      'Marketing': 'bg-yellow-300',
      'Spam': 'bg-red-300',
      'General': 'bg-gray-300',
    };
    return colors[category] || 'bg-gray-300';
  };

  const categories = [
    { name: 'All Mail', description: 'All received emails', icon: Inbox },
    { name: 'Important', description: 'Personal or work-related emails requiring immediate attention', icon: WarningOutlined },
    { name: 'Promotions', description: 'Sales, discounts, and marketing campaigns', icon: TagOutlined },
    { name: 'Social', description: 'Social networks, friends, and family', icon: TeamOutlined },
    { name: 'Marketing', description: 'Marketing, newsletters, and notifications', icon: SoundOutlined },
    { name: 'Spam', description: 'Unwanted or unsolicited emails', icon: StopOutlined },
    { name: 'General', description: 'All other emails', icon: MailOutlined },
  ]

  return (
    <div className='h-[100vh] font- w-full bg-[#0a0a0afb] font-sans flex flex-col text-neutral-300 p-8 px-32'>

      <div className='w-full flex items-end justify-between mb-4'>
          <div className='flex items-center'>
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10.5 lg:w-10.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={session?.user?.image || "https://github.com/shadcn.png"} alt={session?.user?.name || "User"} />
              <AvatarFallback>
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className='ml-4 flex flex-col'>
              <h1 className='font-medium text-lg tracking-tight leading-[0.99]'>
                {session?.user?.name || "Guest User"}
              </h1>
              <p className='text-sm sm:text-base text-neutral-500 leading-[]'>
                {session?.user?.email || "Not logged in"}
              </p>
            </div>
          </div>
          <div className='flex gap-x-6 items-center'>
            <Settings 
              className='text-2xl text-neutral-500 cursor-pointer hover:-rotate-10 transition-transform' 
              onClick={() => setIsSettingsOpen(true)}
            />
            {sessionExpired || !session ? (
              <RainbowButton onClick={handleLogin}>Login</RainbowButton>
            ) : (
              <Button onClick={handleLogout}>Logout</Button>
            )}
          </div>

      </div>
      <div className='w-full flex gap-x-4 mb-4'>
        <MailCountSelector 
          onCountChange={setMailCount}
          initialCount={mailCount}
        />
        <Button 
          variant="outline" 
          className='bg-[#1A1A1A] border-neutral-900 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100'
          onClick={classifyEmails}
          disabled={classifying || emails.length === 0}
        >
          {classifying ? "Classifying emails..." : "Classify"}
        </Button>
      </div>
      <div className='w-full flex-1 grid grid-cols-12 gap-x-4 bg-neutral-900 rounded-lg p-6 pr-4 overflow-y-auto'>
        <div className='col-span-2 flex flex-col gap-2'>
          <h2 className='text-lg font-semibold mb-2 text-neutral-200'>Categories</h2>
          {categories.map((category) => {
            const IconComponent = category.icon
            const isSelected = selectedCategory === category.name
            return (
              <div 
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`flex items-center p-1.5 px-2 rounded-md hover:bg-neutral-800 transition cursor-pointer border ${
                  isSelected 
                    ? 'bg-neutral-800 border-neutral-800' 
                    : 'border-transparent hover:border-neutral-700'
                }`}
              >
                <IconComponent className='text-lg mr-4' />
                <div className='flex flex-col'>
                  <h3 className={`font-medium ${isSelected ? 'text-neutral-100' : 'text-neutral-200'}`}>
                    {category.name}
                  </h3>
                  {/* <p className='text-xs text-neutral-500 mt-0.5'>{category.description}</p> */}
                </div>
              </div>
            )
          })}
        </div>
        <div className='col-span-10 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 pr-2 scrollbar-track-neutral-900'>
          {!session || sessionExpired ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <p className="text-neutral-400 text-lg">Please login to view emails</p>
              <RainbowButton onClick={handleLogin}>Login</RainbowButton>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-neutral-400">Loading emails...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-neutral-400">No emails found</p>
            </div>
          ) : (
            (() => {
              const filteredEmails = getFilteredEmails();
              
              if (filteredEmails.length === 0) {
                return (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-neutral-400">No emails in this category</p>
                  </div>
                );
              }
              
              return filteredEmails.map((email, index) => {
                const isClassified = "category" in email;
                const classifiedEmail = email as ClassifiedEmail;
                
                return (
                  <div 
                    key={email.id || index} 
                    onClick={() => handleEmailClick(email)}
                    className='flex w-full items-center border-b border-neutral-700 p-2.5 hover:border-neutral-600 hover:bg-neutral-800/50 transition border-x-0 cursor-pointer'
                  >
                    
                      {isClassified && (
                        <div className='w-32 flex shrink-0'>
                          <div className={`${getCategoryColor(classifiedEmail.category)} rounded-md px-2 py-0.5`}>
                            <p className='text-sm text-black font-medium'>{classifiedEmail.category}</p>
                          </div>
                        </div>
                      )}
                    
                    <h1 className='font-semibold ml-4 shrink-0 w-48 truncate'>
                      {email.from.split("<")[0].trim() || email.from}
                    </h1>
                    <p className='ml-4 line-clamp-1 text-ellipsis text-sm text-neutral-400 overflow-hidden'>
                      <span className='font-medium text-neutral-300'>{email.subject}</span> - {email.snippet || email.bodyPreview}
                    </p>
                  </div>
                );
              });
            })()
          )}
        </div>
      </div>

      <EmailSheet 
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        selectedEmail={selectedEmail}
        formatDate={formatDate}
        getCategoryColor={getCategoryColor}
      />

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="font-sans sm:max-w-[425px] bg-neutral-900 border-neutral-700 text-neutral-300">
          <DialogHeader>
            <DialogTitle className="text-neutral-100">Settings</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Configure your API key for email classification
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="api-key" className="text-neutral-300">
                API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-neutral-100"
                placeholder="Enter your API key"
              />
              <p className="text-xs text-neutral-500">
                Your API key will be stored locally and used for email classification
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSettingsOpen(false)}
              className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveApiKey}
              className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            >
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Mails