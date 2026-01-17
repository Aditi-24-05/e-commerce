import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    email: string;
}

export function EmailConfirmationDialog({ open, onOpenChange, email }: EmailConfirmationDialogProps) {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const { toast } = useToast();

    const handleConfirm = () => {
        // In a real application, this would send a confirmation email
        // For now, we'll just show a success message
        setIsConfirmed(true);
        toast({
            title: "Confirmation email sent!",
            description: `Please check ${email} for the confirmation link.`,
        });

        // Close the dialog after a short delay
        setTimeout(() => {
            onOpenChange(false);
            setIsConfirmed(false);
        }, 2000);
    };

    const handleSkip = () => {
        onOpenChange(false);
        setIsConfirmed(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        {!isConfirmed ? (
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                        )}
                    </div>
                    <DialogTitle className="text-center text-xl">
                        {!isConfirmed ? "Confirm Your Login" : "Email Sent!"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {!isConfirmed ? (
                            <>
                                To secure your account, please confirm your login using the email sent to{" "}
                                <span className="font-semibold text-foreground">{email}</span>
                            </>
                        ) : (
                            "Please check your inbox and click the confirmation link."
                        )}
                    </DialogDescription>
                </DialogHeader>
                {!isConfirmed && (
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={handleSkip}
                            className="w-full sm:w-auto"
                        >
                            Skip for now
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="w-full sm:w-auto flipkart-btn-primary"
                        >
                            Send confirmation email
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
