/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as path from "path";
import * as moduleAlias from "module-alias";

moduleAlias.addAliases({
    "@ff/react": path.resolve(__dirname, "../export"),
    "@ff/core": path.resolve(__dirname, "../../../ff-core/built/export"),
    "@ff/browser": path.resolve(__dirname, "../../../ff-browser/built/export"),
    "@ff/graph": path.resolve(__dirname, "../../../ff-graph/built/export"),
});

// define vars on node global object (usually done by Webpack)
global["ENV_DEVELOPMENT"] = false;
global["ENV_PRODUCTION"] = true;
global["ENV_VERSION"] = "Test";

////////////////////////////////////////////////////////////////////////////////

suite("FF React", function() {
    // no tests
});
