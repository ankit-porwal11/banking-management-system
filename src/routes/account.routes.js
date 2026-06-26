import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {AccountCreate , depositMoney , withdrowMoney} from "../controllers/account.controller.js"
import { getTransactions } from "../controllers/transaction.controller.js";

const router = Router()

router.route("/create").post(verifyJWT , AccountCreate );
router.route("/deposit").post(verifyJWT , depositMoney );
router.route("/withdraw").post(verifyJWT , withdrowMoney);
router.route("/transaction").get(verifyJWT , getTransactions);


export default router;