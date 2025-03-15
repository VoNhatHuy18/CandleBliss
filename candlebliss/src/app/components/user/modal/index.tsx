import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion"
import { Dialog } from "@headlessui/react"
import cn from "clsx"
import { ReactNode, useEffect } from "react"

const variants = [
  {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", duration: 0.5, bounce: 0.4 }
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } }
  }
]

export const [backdrop, modal] = variants

interface ModalProps {
  open: boolean
  children: ReactNode
  modalContainerClassName?: string
  className?: string
  modalAnimation?: HTMLMotionProps<"div">
  modalClassName?: string
  closePanelOnClick?: boolean
  closeModal: () => void
}

export function Modal({ open, children, modalContainerClassName, className, modalAnimation, modalClassName, closePanelOnClick, closeModal }: ModalProps) {
  useEffect(() => {
    handleHiddenScrollBar()

    return () => {
      document.body.style.overflow = "visible"
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleHiddenScrollBar = () => {
    if (open) return (document.body.style.overflow = "hidden")
    document.body.style.overflow = "visible"
  }

  return (
    <AnimatePresence>
      <Dialog className={cn(modalContainerClassName, "relative z-[9999]")} open={open} onClose={closeModal}>
        <motion.div onClick={closeModal} className={`hover-animation fixed inset-0 bg-black/40 dark:bg-[#5B7083]/40 flex items-center`} aria-hidden="true" {...backdrop} />
        <div onClick={closeModal} className={cn("fixed inset-0 flex items-center justify-center overflow-y-auto p-4", className)}>
          <Dialog.Panel className={modalClassName} as={motion.div} {...(modalAnimation ?? modal)} onClick={closePanelOnClick ? closeModal : undefined}>
            {children}
          </Dialog.Panel>
        </div>
      </Dialog>
    </AnimatePresence>
  )
}
