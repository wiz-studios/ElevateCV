"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Mail, MessageCircle, HelpCircle, Book, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function SupportPage() {
    const [formSubmitted, setFormSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement actual form submission
        console.log("Form submitted:", formData)
        setFormSubmitted(true)
        setTimeout(() => {
            setFormSubmitted(false)
            setFormData({ name: "", email: "", subject: "", message: "" })
        }, 3000)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const faqs = [
        {
            question: "How does the AI resume tailoring work?",
            answer: "Our AI analyzes your resume and the job description to identify key skills, requirements, and keywords. It then rewrites your resume bullets to better match the job posting while maintaining accuracy and your unique voice. The AI uses advanced natural language processing to ensure your experience is presented in the most relevant way for each application."
        },
        {
            question: "What is an ATS score and why does it matter?",
            answer: "ATS (Applicant Tracking System) is software used by employers to filter resumes before they reach human recruiters. Our ATS score indicates how well your resume will perform in these systems based on factors like keyword matching, formatting, and structure. A higher score means your resume is more likely to pass through ATS filters and reach hiring managers."
        },
        {
            question: "How many resumes can I tailor with the free plan?",
            answer: "The free plan includes 3 AI-tailored resumes per month. This resets on the first day of each month. If you need more, you can upgrade to Premium for unlimited tailoring or purchase credit packs for additional one-time uses."
        },
        {
            question: "Can I cancel my subscription anytime?",
            answer: "Yes! You can cancel your subscription at any time from your account settings. If you cancel, you'll retain access to premium features until the end of your current billing period. We also offer a 7-day money-back guarantee for all new subscriptions."
        },
        {
            question: "What file formats do you support?",
            answer: "Currently, we support PDF and plain text resume uploads. We're working on adding support for DOCX files in the near future. For job descriptions, you can paste the text directly or upload a PDF."
        },
        {
            question: "Is my data secure and private?",
            answer: "Absolutely. We take data security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and comply with data protection regulations. Your resume data is never shared with third parties, and you can delete your data at any time. See our Privacy Policy for more details."
        },
        {
            question: "How do credits work?",
            answer: "Credits are a pay-as-you-go option for users who don't need a subscription. Each AI resume tailoring uses 1 credit. Credits never expire and can be used anytime. They're perfect for occasional job seekers or as a supplement to the free plan."
        },
        {
            question: "Can I export my resume to different formats?",
            answer: "Yes! All plans include PDF export. Premium and Enterprise plans also get priority export processing and access to additional template designs. You can also copy the tailored content and paste it into your preferred resume editor."
        },
        {
            question: "What makes ElevateCV different from other resume builders?",
            answer: "ElevateCV focuses specifically on AI-powered job matching and ATS optimization. Unlike generic resume builders, we analyze each job description and tailor your resume accordingly. Our AI understands context and rewrites your experience to highlight the most relevant skills for each position, significantly increasing your chances of getting interviews."
        },
        {
            question: "Do you offer refunds?",
            answer: "Yes, we offer a 7-day money-back guarantee on all subscription plans. If you're not satisfied within the first 7 days, contact us for a full refund. Credit purchases are non-refundable but never expire."
        }
    ]

    const contactMethods = [
        {
            icon: Mail,
            title: "Email Support",
            description: "Get help via email",
            contact: "support@elevatecv.com",
            responseTime: "24-48 hours"
        },
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Chat with our team",
            contact: "Available Mon-Fri, 9am-5pm EST",
            responseTime: "Instant"
        },
        {
            icon: Book,
            title: "Documentation",
            description: "Browse our guides",
            contact: "Help Center",
            responseTime: "Self-service"
        }
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">ElevateCV</h1>
                        </div>
                    </Link>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                        <HelpCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help?</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Get answers to your questions, reach out to our support team, or browse our FAQ
                    </p>
                </div>

                {/* Contact Methods */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {contactMethods.map((method, index) => {
                        const Icon = method.icon
                        return (
                            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">{method.title}</CardTitle>
                                    <CardDescription>{method.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium text-foreground mb-1">{method.contact}</p>
                                    <p className="text-sm text-muted-foreground">Response time: {method.responseTime}</p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-16">
                    {/* Contact Form */}
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">Send us a message</CardTitle>
                            <CardDescription>
                                Fill out the form below and we'll get back to you as soon as possible
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {formSubmitted ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Message sent!</h3>
                                    <p className="text-muted-foreground">
                                        We've received your message and will respond within 24-48 hours.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="Your name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="your@email.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            placeholder="What's this about?"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            placeholder="Tell us more..."
                                            rows={6}
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" size="lg">
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Message
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* FAQ Section */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                        <Card className="border-none shadow-lg">
                            <CardContent className="p-6">
                                <Accordion type="single" collapsible className="w-full">
                                    {faqs.map((faq, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}>
                                            <AccordionTrigger className="text-left">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Additional Resources */}
                <Card className="border-none shadow-lg bg-primary/5">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            Check out our comprehensive documentation, video tutorials, and community forums for more resources.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/terms">View Terms of Service</Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/privacy">Privacy Policy</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Footer */}
            <footer className="border-t mt-12 bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                        <p>© 2024 ElevateCV. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                            <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
