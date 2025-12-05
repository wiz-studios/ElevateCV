import Link from "next/link"
import { ArrowLeft, FileText, Upload, Sparkles, Download, Check, Crown, Zap, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
    title: "How It Works - ElevateCV",
    description: "Learn how ElevateCV helps you create ATS-optimized resumes",
}

export default function HowItWorksPage() {
    const steps = [
        {
            icon: Upload,
            title: "Upload Your Resume",
            description: "Paste your existing resume or upload a PDF. Our AI will parse and understand your experience, skills, and achievements.",
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
            icon: FileText,
            title: "Add Job Description",
            description: "Paste the job posting you're applying for. We'll analyze the requirements, keywords, and skills the employer is looking for.",
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-100 dark:bg-purple-900/20",
        },
        {
            icon: Sparkles,
            title: "AI Tailors Your Resume",
            description: "Our AI rewrites your resume bullets to match the job description, highlighting relevant experience and incorporating key terms.",
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-100 dark:bg-amber-900/20",
        },
        {
            icon: TrendingUp,
            title: "Get ATS Score",
            description: "See how well your resume matches the job and get insights on keyword optimization, formatting, and missing skills.",
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-100 dark:bg-green-900/20",
        },
        {
            icon: Download,
            title: "Download & Apply",
            description: "Export your tailored resume as a PDF and submit it with confidence, knowing it's optimized for both ATS and human reviewers.",
            color: "text-rose-600 dark:text-rose-400",
            bgColor: "bg-rose-100 dark:bg-rose-900/20",
        },
    ]

    const plans = [
        {
            name: "Free Plan",
            icon: FileText,
            quota: "3 tailored resumes/month",
            features: [
                "3 AI-tailored resumes per month",
                "Basic ATS scoring",
                "PDF export",
                "Standard templates",
            ],
            note: "Perfect for trying out the platform",
        },
        {
            name: "Premium Plan",
            icon: Crown,
            quota: "Unlimited",
            features: [
                "Unlimited AI-tailored resumes",
                "Advanced ATS insights",
                "Priority export",
                "Premium templates",
                "Cover letter generator",
                "LinkedIn optimization",
            ],
            note: "Best for active job seekers",
            popular: true,
        },
        {
            name: "Credits",
            icon: Zap,
            quota: "Pay as you go",
            features: [
                "Purchase 5, 15, or 50 credits",
                "1 credit = 1 AI tailor",
                "Credits never expire",
                "Use anytime",
            ],
            note: "Great for occasional use",
        },
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
                <div className="text-center mb-16">
                    <Badge className="mb-4" variant="secondary">How It Works</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Get More Interviews with AI-Optimized Resumes
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        ElevateCV uses advanced AI to tailor your resume for each job application, ensuring it passes ATS filters and impresses hiring managers.
                    </p>
                </div>

                {/* Process Steps */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-12">The Process</h2>
                    <div className="space-y-8">
                        {steps.map((step, index) => {
                            const Icon = step.icon
                            return (
                                <Card key={index} className="border-none shadow-lg overflow-hidden">
                                    <CardContent className="p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            <div className="flex-shrink-0">
                                                <div className={`w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center`}>
                                                    <Icon className={`h-8 w-8 ${step.color}`} />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge variant="outline" className="text-xs">Step {index + 1}</Badge>
                                                    <h3 className="text-xl font-semibold">{step.title}</h3>
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* Plans & Credits Explanation */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-4">Plans & Credits</h2>
                    <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                        Choose the plan that fits your job search needs. All plans include our core AI tailoring technology.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {plans.map((plan, index) => {
                            const Icon = plan.icon
                            return (
                                <Card key={index} className={`border-none shadow-lg ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                                    {plan.popular && (
                                        <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                                            Most Popular
                                        </div>
                                    )}
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                                        <CardDescription className="text-lg font-semibold text-foreground">{plan.quota}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 mb-4">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-xs text-muted-foreground italic">{plan.note}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    {/* How Credits Work */}
                    <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-primary" />
                                How Credits Work
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-2">For Free Users:</h4>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5" />
                                            <span>Get 3 free AI tailors per month</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5" />
                                            <span>Quota resets on the 1st of each month</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5" />
                                            <span>Purchase credits if you need more</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5" />
                                            <span>Credits are used after monthly quota</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">For Premium Users:</h4>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5" />
                                            <span>Unlimited AI tailors included</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5" />
                                            <span>Credits are NOT consumed</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5" />
                                            <span>Save credits for after subscription</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5" />
                                            <span>Credits never expire</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ATS Explanation */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-4">What is ATS?</h2>
                    <Card className="border-none shadow-lg">
                        <CardContent className="p-6 md:p-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Applicant Tracking Systems</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Over 90% of large companies use ATS software to filter resumes before they reach human recruiters. These systems scan for:
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-1" />
                                            <span className="text-sm">Keywords matching the job description</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-1" />
                                            <span className="text-sm">Relevant skills and experience</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-1" />
                                            <span className="text-sm">Proper formatting and structure</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-1" />
                                            <span className="text-sm">Education and qualification requirements</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">How ElevateCV Helps</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Our AI analyzes both your resume and the job description to:
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <Sparkles className="h-4 w-4 text-amber-500 mt-1" />
                                            <span className="text-sm">Incorporate relevant keywords naturally</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Sparkles className="h-4 w-4 text-amber-500 mt-1" />
                                            <span className="text-sm">Highlight matching skills and experience</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Sparkles className="h-4 w-4 text-amber-500 mt-1" />
                                            <span className="text-sm">Optimize formatting for ATS parsing</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Sparkles className="h-4 w-4 text-amber-500 mt-1" />
                                            <span className="text-sm">Provide a match score and improvement tips</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Security & Privacy */}
                <div className="mb-12">
                    <Card className="border-none shadow-lg bg-muted/30">
                        <CardContent className="p-6 md:p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                                <Shield className="h-8 w-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">Your Data is Secure</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                                We take your privacy seriously. Your resume data is encrypted, never shared with third parties, and you can delete it anytime. We're SOC 2 compliant and follow industry best practices for data security.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button variant="outline" asChild>
                                    <Link href="/privacy">Privacy Policy</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/support">Contact Support</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-muted-foreground mb-6">
                        Join thousands of job seekers who have improved their interview rates with ElevateCV
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild>
                            <Link href="/signup">Start Free Trial</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/pricing">View Pricing</Link>
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
