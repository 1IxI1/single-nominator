import BN from "bn.js";
import { Address, beginCell, Cell, contractAddress, InternalMessage, toNano } from "ton";
import { SmartContract } from "ton-contract-executor";
import { compileFuncToB64 } from "../helpers";


export class SingleNominatorSpec {
    contract: SmartContract;
    address: Address;

    private constructor(contract: SmartContract, myAddress: Address, balance: BN) {
        this.contract = contract;
        this.address = myAddress;
        contract.setC7Config({
            balance: balance.toNumber(),
            myself: myAddress,
        });
    }

    async sendInternalMessage(message: InternalMessage) {
        return this.contract.sendInternalMessage(message);
    }

    static getCode(): Cell[] {
        const nominatorCode: string = compileFuncToB64(["test/contracts/test-config.fc", "contracts/imports/stdlib.fc", "contracts/single-nominator.fc"]);
        return Cell.fromBoc(nominatorCode);
    }

    static async Create(balance = toNano(10), owner: Address, validator: Address, firewall_wc = -1, isUnitTest = true) {
        const codeCell = SingleNominatorSpec.getCode()[0];
        const dataCell = beginCell().storeAddress(owner).storeAddress(validator).endCell();
        const contract = await SmartContract.fromCell(codeCell, dataCell, {
            getMethodsMutate: true,
            debug: true,
        });
        const myAddress = contractAddress({ workchain: firewall_wc, initialCode: codeCell, initialData: dataCell });
        return new SingleNominatorSpec(contract, myAddress, balance);
    }
}