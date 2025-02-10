import {
  Loader2,
  LogIn,
  Mail,
  Github,
  LucideProps,
  MessageSquare,
} from "lucide-react"

export const Icons = {
  spinner: Loader2,
  login: LogIn,
  logo: MessageSquare,
  google: Mail,
  gitHub: Github,
}

export type Icon = keyof typeof Icons 