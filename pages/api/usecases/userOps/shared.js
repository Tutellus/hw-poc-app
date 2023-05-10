const { ethers } = require("ethers")
const { abi: HumanAbi } = require("../../abi/Human.json")

const packUserOp = (userOpData) => {
    // lighter signature scheme (must match UserOperation#pack): do encode a zero-length signature, but strip afterwards the appended zero-length value
    const userOpType = {
        components: [
            { type: "address", name: "sender" },
            { type: "uint256", name: "nonce" },
            { type: "bytes", name: "initCode" },
            { type: "bytes", name: "callData" },
            { type: "uint256", name: "callGasLimit" },
            { type: "uint256", name: "verificationGasLimit" },
            { type: "uint256", name: "preVerificationGas" },
            { type: "uint256", name: "maxFeePerGas" },
            { type: "uint256", name: "maxPriorityFeePerGas" },
            { type: "bytes", name: "paymasterAndData" },
            { type: "bytes", name: "signature" }
        ],
        name: "userOp",
        type: "tuple"
    }
    let encoded = ethers.utils.defaultAbiCoder.encode([userOpType], [userOpData])
    // remove leading word (total length) and trailing word (zero-length signature)
    encoded = "0x" + encoded.slice(66, encoded.length - 64)
    return encoded
};

const getUserOpHash = ({
    userOpData,
    entryPoint,
    chainId,
}) => {
    const userOpHash = ethers.utils.id(packUserOp(userOpData));
    const enc = ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "address", "uint256"],
        [userOpHash, entryPoint, chainId]);
    return ethers.utils.id(enc);
};

const getEmptyUserOperation = () => ({
    sender: ethers.constants.AddressZero,
    nonce: "0",
    initCode: "0x",
    callData: "0x",
    callGasLimit: "0",
    verificationGasLimit: "0",
    preVerificationGas: "0",
    maxFeePerGas: "0",
    maxPriorityFeePerGas: "0",
    paymasterAndData: "0x",
    signature: "0x",
});

const encodeFunctionData = ({
    abi,
    method = "",
    params = [],
}) => new ethers.utils.Interface(abi).encodeFunctionData(method, params);

const getExecuteData = ({
    operationType = "0", // v1 only allows operationType = 0
    target,
    value = "0",
    data = "0x",
    signature = "0x",
}) => {
    const executeData = ethers.utils.defaultAbiCoder.encode(["bytes", "bytes"], [data, signature]);
    return encodeFunctionData({
        abi: HumanAbi,
        method: "execute(uint256,address,uint256,bytes)",
        params: [operationType, target, value, executeData]
    });
};

const estimateGas = async ({
    provider,
    abi,
    from,
    to,
    data,
    value = "0",
}) => new ethers.Contract(to, abi, provider).estimateGas({ from, data, value });

const masterSign = async ({
    humanAddress,
    operationType = "0", // v1 only allows operationType = 0
    target,
    value = "0",
    data = "0x",
    masterSigner,
}) => {
    const encoded = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "address", "uint256", "bytes32"],
        [humanAddress, operationType, target, value, ethers.utils.keccak256(data)]
    );
    const hash = ethers.utils.keccak256(encoded);
    const signature = await masterSigner.signMessage(ethers.utils.arrayify(hash));
    return signature;
};

module.exports = {
    getUserOpHash,
    packUserOp,
    getEmptyUserOperation,
    getExecuteData,
    estimateGas,
    masterSign,
}