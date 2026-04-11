"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { ROUTES } from "@/config/routes";
import { registerSchema } from "@/lib/validations";
import { authService } from "@/services/authService";

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await authService.register(data);
            showToast("Registration successful! Please check your email for OTP.", "success");
            router.push(ROUTES.VERIFY_OTP);
        } catch (error: any) {
            showToast(error.response?.data?.message || "Registration failed", "error");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                            <Package className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <CardDescription>
                        Enter your information to get started
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <Input
                            {...register("name")}
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            error={errors.name?.message}
                            autoComplete="name"
                        />

                        <Input
                            {...register("email")}
                            label="Email"
                            type="email"
                            placeholder="john@example.com"
                            error={errors.email?.message}
                            autoComplete="email"
                        />

                        <div className="relative">
                            <Input
                                {...register("password")}
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                error={errors.password?.message}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>Password must contain:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>At least 6 characters</li>
                                <li>1 uppercase letter</li>
                                <li>1 lowercase letter</li>
                                <li>1 number</li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" isLoading={isSubmitting}>
                            Create Account
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href={ROUTES.LOGIN} className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
