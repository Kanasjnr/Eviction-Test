import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ERC20TokenModule = buildModule("TokenModule", (m) => {
  const ERC20Token = m.contract("ERC20Token");

  return { ERC20Token };
});

export default ERC20TokenModule;