import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AuthorizationRegistryModule = buildModule("AuthorizationRegistryModule", (m) => {
  const name = m.getParameter("name", "RavenAuth");
  const version = m.getParameter("version", "1");
  const registry = m.contract("AuthorizationRegistry", [name, version]);
  return { registry };
});

export default AuthorizationRegistryModule;