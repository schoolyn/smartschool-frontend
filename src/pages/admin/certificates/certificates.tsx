import { Route, Routes } from "react-router-dom";

import { PermissionGate } from "@/entities/session";
import CertificateRegister from "./register/certificate-register";
import IssueCertificate from "./issue/issue-certificate";

const Certificates = () => (
  <Routes>
    <Route index element={<CertificateRegister />} />
    <Route
      path="issue/:studentId"
      element={
        <PermissionGate anyOf={["certificates.issue"]}>
          <IssueCertificate />
        </PermissionGate>
      }
    />
  </Routes>
);

export default Certificates;
