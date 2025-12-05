import Link from "next/link"
import { ArrowLeft, FileText, Settings as SettingsIcon, User, Bell, Shield, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata = {
    title: "Settings - ElevateCV",
    description: "Manage your account settings",
}

export default function SettingsPage() {
    const settingsSections = [
        {
            icon: User,
            title: "Profile Settings",
            description: "Update your personal information and preferences",
            href: "/account",
        },
        {
            icon: Bell,
            title: "Notifications",
            description: "Manage email and push notifications",
            href: "/account",
        },
        {
            icon: Shield,
            title: "Privacy & Security",
            description: "Control your privacy settings and security options",
            href: "/account",
        },
        {
            icon: Key,
            title: "Password & Authentication",
            description: "Change your password and manage 2FA",
            href: "/account",
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
                        <Link href="/account">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Account
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-muted-foreground">Manage your account preferences and settings</p>
                </div>

                <div className="space-y-6">
                    {settingsSections.map((section, index) => {
                        const Icon = section.icon
                        return (
                            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{section.title}</CardTitle>
                                                <CardDescription className="mt-1">{section.description}</CardDescription>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={section.href}>Configure</Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                            </Card>
                        )
                    })}
                </div>

                <Separator className="my-8" />

                <Card className="border-none shadow-md bg-muted/30">
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground text-center">
                            Need help with settings?{" "}
                            <Link href="/support" className="text-primary hover:underline">
                                Contact Support
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
