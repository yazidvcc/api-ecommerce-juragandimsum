import "dotenv/config.js";
import { web } from "../src/application/web.js";

web.listen(process.env.PORT, () => {
    console.log("Start Application", process.env.PORT);
});