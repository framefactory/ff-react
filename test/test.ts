/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as path from "path";
import * as moduleAlias from "module-alias";

moduleAlias.addAliases({
    "@ff/react": path.resolve(__dirname, "../exports"),
    "@ff/core": path.resolve(__dirname, "../../../core/dist/exports"),
    "@ff/browser": path.resolve(__dirname, "../../../browser/dist/exports"),
    "@ff/graph": path.resolve(__dirname, "../../../graph/dist/exports"),
});

// define vars on node global object (usually done by Webpack)
global["ENV_DEVELOPMENT"] = false;
global["ENV_PRODUCTION"] = true;
global["ENV_VERSION"] = "Test";

////////////////////////////////////////////////////////////////////////////////

suite("FF React", function() {
    // no tests
});
