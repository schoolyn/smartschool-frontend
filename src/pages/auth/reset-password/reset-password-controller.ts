import { useResetUserPassword } from "@/entities/session";

const useResetPasswordController = () => ({ mutation: useResetUserPassword() });

export default useResetPasswordController;
