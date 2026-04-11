"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Package, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { ROUTES } from "@/config/routes";
import { authService } from "@/services/authService";
import axios from "@/lib/axios";

const otpSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
});

type OTPFormData = z.infer<typeof otpSchema>;

export default function VerifyOTPPage() {
    const [isResending, setIsResending] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<OTPFormData>({
        resolver: zodResolver(otpSchema),
    });

    const onSubmit = async (data: OTPFormData) => {
        try {
            await authService.verifyOtp({ email: data.email, otp: data.otp });
            showToast("Email verified successfully!", "success");
            router.push(ROUTES.LOGIN);
        } catch (error: any) {
            showToast(error.response?.data?.message || "Verification failed", "error");
        }
    };

    const handleResendOTP = async () => {
        const email = getValues("email");
        if (!email) {
            showToast("Please enter your email first", "error");
            return;
        }

        setIsResending(true);
        try {
            await axios.post('/auth/resend-otp', { email });
            showToast("OTP sent successfully!", "success");
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to resend OTP", "error");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                            <Mail className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                    <CardDescription>
                        Enter the 6-digit code sent to your email address
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <Input
                            {...register("email")}
                            label="Email"
                            type="email"
                            placeholder="john@example.com"
                            error={errors.email?.message}
                            autoComplete="email"
                        />

                        <Input
                            {...register("otp")}
                            label="OTP Code"
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            error={errors.otp?.message}
                            autoComplete="one-time-code"
                        />

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={isResending}
                                className="text-sm text-primary hover:underline disabled:opacity-50"
                            >
                                {isResending ? "Sending..." : "Resend OTP"}
                            </button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" isLoading={isSubmitting}>
                            Verify Email
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
