import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DemoRelayTargetModule = buildModule("DemoRelayTarget", (m) => {
  const demo = m.contract("DemoRelayTarget");
  return { demo };
});

export default DemoRelayTargetModule;



