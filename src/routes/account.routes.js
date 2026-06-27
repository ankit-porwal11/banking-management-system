import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {AccountCreate , depositMoney , withdrowMoney, getAccountDetails} from "../controllers/account.controller.js"
import { getTransactions , getLedgerHistory } from "../controllers/transaction.controller.js";
import  { transferMoney , createInitialFundTransaction} from "../controllers/transfer.controller.js"

const router = Router();

router.route("/create").post(verifyJWT , AccountCreate );
router.route("/deposit").post(verifyJWT , depositMoney );
router.route("/withdraw").post(verifyJWT , withdrowMoney);
router.route("/transaction").get(verifyJWT , getTransactions);
router.route("/transfer").post(verifyJWT, transferMoney);
router.route("/initialfund").post(verifyJWT , createInitialFundTransaction);
router.route("/ledger-history").get(verifyJWT, getLedgerHistory);
router.route("/details").post(verifyJWT , getAccountDetails)

export default router;