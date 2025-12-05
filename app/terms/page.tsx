import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
    title: "Terms of Service - ElevateCV",
    description: "Terms of Service for ElevateCV AI Resume Builder",
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
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
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
                    <p className="text-muted-foreground">Last updated: December 5, 2024</p>
                </div>

                <Card className="border-none shadow-lg">
                    <CardContent className="p-6 md:p-8 space-y-8">
                        {/* Introduction */}
                        <section>
                            <p className="text-muted-foreground leading-relaxed">
                                Welcome to ElevateCV. By accessing or using our AI-powered resume building service, you agree to be bound by these Terms of Service. Please read them carefully.
                            </p>
                        </section>

                        {/* Service Description */}
                        <section>
                            <CardTitle className="text-xl mb-4">1. Service Description</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    ElevateCV provides an AI-powered resume building and optimization platform that helps users create, tailor, and optimize their resumes for specific job applications. Our services include:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>AI-powered resume tailoring to match job descriptions</li>
                                    <li>ATS (Applicant Tracking System) compatibility scoring</li>
                                    <li>Resume parsing and formatting</li>
                                    <li>PDF export functionality</li>
                                    <li>Template selection and customization</li>
                                </ul>
                            </div>
                        </section>

                        {/* User Accounts */}
                        <section>
                            <CardTitle className="text-xl mb-4">2. User Accounts</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    To access certain features of ElevateCV, you must create an account. You agree to:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Provide accurate, current, and complete information during registration</li>
                                    <li>Maintain and promptly update your account information</li>
                                    <li>Maintain the security of your password and account</li>
                                    <li>Accept responsibility for all activities that occur under your account</li>
                                    <li>Notify us immediately of any unauthorized use of your account</li>
                                </ul>
                            </div>
                        </section>

                        {/* Acceptable Use */}
                        <section>
                            <CardTitle className="text-xl mb-4">3. Acceptable Use</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>You agree not to use ElevateCV to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Violate any applicable laws or regulations</li>
                                    <li>Infringe upon the rights of others</li>
                                    <li>Transmit any harmful, offensive, or inappropriate content</li>
                                    <li>Attempt to gain unauthorized access to our systems</li>
                                    <li>Interfere with or disrupt the service or servers</li>
                                    <li>Use automated systems to access the service without permission</li>
                                    <li>Resell or redistribute our services without authorization</li>
                                </ul>
                            </div>
                        </section>

                        {/* Subscription and Billing */}
                        <section>
                            <CardTitle className="text-xl mb-4">4. Subscription and Billing</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    ElevateCV offers both free and paid subscription plans. For paid plans:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                                    <li>You authorize us to charge your payment method for recurring fees</li>
                                    <li>Prices are subject to change with 30 days notice</li>
                                    <li>Refunds are provided within 7 days of purchase as per our money-back guarantee</li>
                                    <li>You can cancel your subscription at any time from your account settings</li>
                                </ul>
                            </div>
                        </section>

                        {/* Intellectual Property */}
                        <section>
                            <CardTitle className="text-xl mb-4">5. Intellectual Property</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    You retain all rights to the content you upload to ElevateCV, including your resume information. By using our service, you grant us a limited license to process, store, and display your content solely for the purpose of providing our services.
                                </p>
                                <p>
                                    All ElevateCV software, designs, logos, and other materials are owned by us or our licensors and are protected by intellectual property laws.
                                </p>
                            </div>
                        </section>

                        {/* Disclaimers */}
                        <section>
                            <CardTitle className="text-xl mb-4">6. Disclaimers</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    ElevateCV is provided "as is" and "as available" without warranties of any kind. We do not guarantee:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>That our service will be uninterrupted or error-free</li>
                                    <li>The accuracy or completeness of AI-generated content</li>
                                    <li>That using our service will result in job offers or interviews</li>
                                    <li>That your resume will pass all ATS systems</li>
                                </ul>
                                <p className="mt-3">
                                    You are responsible for reviewing and verifying all AI-generated content before use.
                                </p>
                            </div>
                        </section>

                        {/* Limitation of Liability */}
                        <section>
                            <CardTitle className="text-xl mb-4">7. Limitation of Liability</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    To the maximum extent permitted by law, ElevateCV shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Your use or inability to use the service</li>
                                    <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
                                    <li>Any interruption or cessation of transmission to or from the service</li>
                                    <li>Any bugs, viruses, or other harmful code that may be transmitted through the service</li>
                                </ul>
                            </div>
                        </section>

                        {/* Termination */}
                        <section>
                            <CardTitle className="text-xl mb-4">8. Termination</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    We reserve the right to suspend or terminate your account and access to ElevateCV at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
                                </p>
                                <p>
                                    You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
                                </p>
                            </div>
                        </section>

                        {/* Changes to Terms */}
                        <section>
                            <CardTitle className="text-xl mb-4">9. Changes to Terms</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by email or through a notice on our website. Your continued use of ElevateCV after such modifications constitutes your acceptance of the updated terms.
                                </p>
                            </div>
                        </section>

                        {/* Governing Law */}
                        <section>
                            <CardTitle className="text-xl mb-4">10. Governing Law</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which ElevateCV operates, without regard to its conflict of law provisions.
                                </p>
                            </div>
                        </section>

                        {/* Contact */}
                        <section>
                            <CardTitle className="text-xl mb-4">11. Contact Information</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    If you have any questions about these Terms of Service, please contact us at:
                                </p>
                                <p className="font-medium text-foreground">
                                    Email: support@elevatecv.com
                                </p>
                            </div>
                        </section>
                    </CardContent>
                </Card>

                {/* Footer Navigation */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center text-sm text-muted-foreground">
                    <Link href="/privacy" className="hover:text-foreground transition-colors">
                        Privacy Policy →
                    </Link>
                    <Link href="/" className="hover:text-foreground transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </div>
    )
}
