import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Manager',
    content: 'Paigham has revolutionized our communication strategy. It\'s so easy to use and incredibly powerful.',
    avatar: 'SJ'
  },
  {
    name: 'Alex Chen',
    role: 'E-commerce Owner',
    content: 'The omni-channel approach of Paigham has helped us reach our customers more effectively than ever before.',
    avatar: 'AC'
  },
  {
    name: 'Emily Brown',
    role: 'Customer Success Lead',
    content: 'Our team loves using Paigham. It\'s intuitive and has greatly improved our customer engagement.',
    avatar: 'EB'
  }
]

export default function Testimonials() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={`/placeholder-avatar.jpg`} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{testimonial.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}