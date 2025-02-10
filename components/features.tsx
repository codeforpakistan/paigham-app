import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, MessageCircle, Bell, Zap } from 'lucide-react'

const features = [
  {
    icon: <Mail className="h-8 w-8 mb-4 text-primary" />,
    title: 'Email Campaigns',
    description: 'Create and send beautiful email campaigns with ease.'
  },
  {
    icon: <MessageCircle className="h-8 w-8 mb-4 text-primary" />,
    title: 'SMS Messaging',
    description: 'Reach your audience instantly with bulk SMS messaging.'
  },
  {
    icon: <Bell className="h-8 w-8 mb-4 text-primary" />,
    title: 'Push Notifications',
    description: 'Engage users with timely push notifications.'
  },
  {
    icon: <Zap className="h-8 w-8 mb-4 text-primary" />,
    title: 'Automation',
    description: 'Set up automated workflows for seamless communication.'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex flex-col items-center">
                  {feature.icon}
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}