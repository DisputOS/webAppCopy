// components/ui/dialog.tsx
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface DialogProps extends React.ComponentProps<typeof DialogPrimitive.Root> {}
interface DialogTriggerProps extends React.ComponentProps<typeof DialogPrimitive.Trigger> {}
interface DialogOverlayProps extends React.ComponentProps<typeof DialogPrimitive.Overlay> {}
interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  children: React.ReactNode;
}

// Root dialog context
export const Dialog = ({ children, ...props }: DialogProps) => (
  <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>
);

// The element to open the dialog
export const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  DialogTriggerProps
>(({ children, ...props }, ref) => (
  <DialogPrimitive.Trigger ref={ref} className="" {...props}>
    {children}
  </DialogPrimitive.Trigger>
));

// Overlay behind content
export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={
      `fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in` +
      (className ? ` ${className}` : "")
    }
    {...props}
  />
));

// Main content container
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={
        `fixed top-1/2 left-1/2 w-[90vw] max-w-xl max-h-[85vh] p-6 bg-white rounded-2xl shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-scale-in` +
        (className ? ` ${className}` : "")
      }
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className="absolute top-4 right-4 inline-flex items-center justify-center rounded-full hover:bg-gray-200 p-1"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-gray-600" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));

// Re-export other Radix primitives for convenience
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
