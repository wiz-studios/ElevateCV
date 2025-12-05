import Link from "next/link"
import { ArrowLeft, FileText, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
    title: "Privacy Policy - ElevateCV",
    description: "Privacy Policy for ElevateCV AI Resume Builder",
}

export default function PrivacyPage() {
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
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold">Privacy Policy</h1>
                    </div>
                    <p className="text-muted-foreground">Last updated: December 5, 2024</p>
                </div>

                <Card className="border-none shadow-lg">
                    <CardContent className="p-6 md:p-8 space-y-8">
                        {/* Introduction */}
                        <section>
                            <p className="text-muted-foreground leading-relaxed">
                                At ElevateCV, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered resume building service.
                            </p>
                        </section>

                        {/* Information We Collect */}
                        <section>
                            <CardTitle className="text-xl mb-4">1. Information We Collect</CardTitle>
                            <div className="space-y-4 text-muted-foreground leading-relaxed">
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                                    <p>When you create an account, we collect:</p>
                                    <ul className="list-disc pl-6 space-y-2 mt-2">
                                        <li>Name and email address</li>
                                        <li>Password (encrypted)</li>
                                        <li>Payment information (processed securely through Stripe)</li>
                                        <li>Subscription and billing details</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Resume Content</h3>
                                    <p>When you use our service, we collect and process:</p>
                                    <ul className="list-disc pl-6 space-y-2 mt-2">
                                        <li>Resume text and uploaded files</li>
                                        <li>Job descriptions you provide</li>
                                        <li>AI-generated resume content</li>
                                        <li>Template preferences and customizations</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Usage Information</h3>
                                    <p>We automatically collect:</p>
                                    <ul className="list-disc pl-6 space-y-2 mt-2">
                                        <li>IP address and device information</li>
                                        <li>Browser type and version</li>
                                        <li>Pages visited and features used</li>
                                        <li>Time and date of visits</li>
                                        <li>Usage statistics and analytics</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* How We Use Your Information */}
                        <section>
                            <CardTitle className="text-xl mb-4">2. How We Use Your Information</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>We use the information we collect to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Provide, maintain, and improve our resume building services</li>
                                    <li>Process your resume content using AI technology</li>
                                    <li>Generate tailored resumes and ATS scores</li>
                                    <li>Process payments and manage subscriptions</li>
                                    <li>Send you service-related notifications and updates</li>
                                    <li>Respond to your inquiries and provide customer support</li>
                                    <li>Analyze usage patterns to improve our service</li>
                                    <li>Detect and prevent fraud or abuse</li>
                                    <li>Comply with legal obligations</li>
                                </ul>
                            </div>
                        </section>

                        {/* Data Storage and Security */}
                        <section>
                            <CardTitle className="text-xl mb-4">3. Data Storage and Security</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    We implement industry-standard security measures to protect your information:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Data is encrypted in transit using SSL/TLS</li>
                                    <li>Passwords are hashed and never stored in plain text</li>
                                    <li>Data is stored in secure, SOC 2 compliant databases (Supabase)</li>
                                    <li>Access to personal data is restricted to authorized personnel only</li>
                                    <li>Regular security audits and updates</li>
                                </ul>
                                <p className="mt-3">
                                    However, no method of transmission over the Internet is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
                                </p>
                            </div>
                        </section>

                        {/* Third-Party Services */}
                        <section>
                            <CardTitle className="text-xl mb-4">4. Third-Party Services</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>We use the following third-party services:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Supabase:</strong> Database and authentication services</li>
                                    <li><strong>Stripe:</strong> Payment processing (they have their own privacy policy)</li>
                                    <li><strong>OpenAI:</strong> AI processing for resume tailoring</li>
                                    <li><strong>Analytics Services:</strong> To understand how users interact with our service</li>
                                </ul>
                                <p className="mt-3">
                                    These third parties have access to your information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                                </p>
                            </div>
                        </section>

                        {/* Cookies and Tracking */}
                        <section>
                            <CardTitle className="text-xl mb-4">5. Cookies and Tracking Technologies</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    We use cookies and similar tracking technologies to:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Maintain your session and keep you logged in</li>
                                    <li>Remember your preferences and settings</li>
                                    <li>Analyze usage patterns and improve our service</li>
                                    <li>Provide personalized content and features</li>
                                </ul>
                                <p className="mt-3">
                                    You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our service.
                                </p>
                            </div>
                        </section>

                        {/* Your Rights */}
                        <section>
                            <CardTitle className="text-xl mb-4">6. Your Privacy Rights</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>You have the right to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                                    <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                                    <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                                    <li><strong>Export:</strong> Request a copy of your data in a portable format</li>
                                    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                                    <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                                </ul>
                                <p className="mt-3">
                                    To exercise these rights, please contact us at privacy@elevatecv.com. We will respond to your request within 30 days.
                                </p>
                            </div>
                        </section>

                        {/* Data Retention */}
                        <section>
                            <CardTitle className="text-xl mb-4">7. Data Retention</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Account information is retained while your account is active</li>
                                    <li>Resume content is retained until you delete it or close your account</li>
                                    <li>Billing information is retained for tax and accounting purposes</li>
                                    <li>Usage logs are retained for up to 90 days</li>
                                </ul>
                                <p className="mt-3">
                                    When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it by law.
                                </p>
                            </div>
                        </section>

                        {/* Children's Privacy */}
                        <section>
                            <CardTitle className="text-xl mb-4">8. Children's Privacy</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    ElevateCV is not intended for use by children under the age of 16. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will delete such information.
                                </p>
                            </div>
                        </section>

                        {/* International Data Transfers */}
                        <section>
                            <CardTitle className="text-xl mb-4">9. International Data Transfers</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and that your data receives an adequate level of protection.
                                </p>
                            </div>
                        </section>

                        {/* Changes to Privacy Policy */}
                        <section>
                            <CardTitle className="text-xl mb-4">10. Changes to This Privacy Policy</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Posting the new Privacy Policy on this page</li>
                                    <li>Updating the "Last updated" date</li>
                                    <li>Sending you an email notification (for significant changes)</li>
                                </ul>
                                <p className="mt-3">
                                    We encourage you to review this Privacy Policy periodically for any changes.
                                </p>
                            </div>
                        </section>

                        {/* Contact */}
                        <section>
                            <CardTitle className="text-xl mb-4">11. Contact Us</CardTitle>
                            <div className="space-y-3 text-muted-foreground leading-relaxed">
                                <p>
                                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                                </p>
                                <div className="mt-3 space-y-1">
                                    <p className="font-medium text-foreground">Email: privacy@elevatecv.com</p>
                                    <p className="font-medium text-foreground">Support: support@elevatecv.com</p>
                                </div>
                            </div>
                        </section>
                    </CardContent>
                </Card>

                {/* Footer Navigation */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center text-sm text-muted-foreground">
                    <Link href="/terms" className="hover:text-foreground transition-colors">
                        Terms of Service →
                    </Link>
                    <Link href="/" className="hover:text-foreground transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </div>
    )
}
