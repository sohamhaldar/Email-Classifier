export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  bodyPreview: string;
  body?: string;
  htmlBody?: string;
  textBody?: string;
  date: string;
}

export interface ClassifiedEmail extends Email {
  category: string;
}

export interface EmailSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedEmail: Email | ClassifiedEmail | null
  formatDate: (dateString: string) => string
  getCategoryColor: (category: string) => string
}
