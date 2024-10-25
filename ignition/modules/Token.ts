import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokenModule = buildModule("TokenModule", (m) => {
  const Token = m.contract("Token");

  return { Token };
});

export default TokenModule;