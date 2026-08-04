import { clerk } from "@vendoai/vendo/auth/clerk";
import { createVendo, nextVendoHandler } from "@vendoai/vendo/server";
import { registry } from "../../../../vendo/registry";

const vendo = createVendo({
  // Detected @clerk/nextjs — clerk() fills the identity seams
  // (request→user, actAs, door OAuth); options and the per-seam escape
  // hatch: docs/act-as-presets.md.
  auth: clerk(),
  catalog: registry,
  policy: {}, // .vendo/policy.json: destructive asks, reads run
});

export const { GET, POST, PUT, PATCH, DELETE } = nextVendoHandler(vendo);
