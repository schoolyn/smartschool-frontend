import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const useUserManagementController = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { organizationId } = useParams<{ organizationId: string }>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (location.pathname.includes("/settings/add-user")) {
      setSelectedIndex(1);
    } else if (location.pathname.includes("/settings/notifications")) {
      setSelectedIndex(2);
    } else if (location.pathname.includes("/settings/profile")) {
      setSelectedIndex(0);
    } else {
      navigate(`/${organizationId}/admin/settings/profile`, { replace: true });
    }
  }, [location.pathname, navigate, organizationId]);

  const handleTabChange = (index: number) => {
    if (selectedIndex !== index) {
      setSelectedIndex(index);

      const targetPath =
        index === 0
          ? `/${organizationId}/admin/settings/profile`
          : index === 1
            ? `/${organizationId}/admin/settings/add-user`
            : `/${organizationId}/admin/settings/notifications`;

      if (location.pathname !== targetPath) {
        navigate(targetPath);
      }
    }
  };

  return {
    t,
    selectedIndex,
    handleTabChange,
  };
};

export default useUserManagementController;
