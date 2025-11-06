/**
 * @file use-toast.ts
 * @description Toast 알림 훅
 *
 * shadcn/ui Toast 컴포넌트 사용을 위한 훅
 */

import { useToast as useToastPrimitive } from "@/hooks/use-toast-primitive";

export const useToast = useToastPrimitive;

