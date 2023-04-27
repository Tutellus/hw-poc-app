const { ethers } = require("ethers")
const { abi: HumanAbi } = require("../../abi/Human.json")
const { bytecode: { object: BeaconProxyBytecode } } = require("../../abi/BeaconProxy.json")

const encodeFunctionData = ({
    method,
    params
}) => {
    const humanInterface = new ethers.utils.Interface(HumanAbi);
    return humanInterface.encodeFunctionData(method, params);
};

const getExecuteData = ({
    operationType = "0",
    target,
    value,
    data,
    signature = "0x",
}) => {
    const executeData = ethers.utils.defaultAbiCoder.encode(["bytes", "bytes"], [data, signature]);
    return encodeFunctionData({
        method: "execute",
        params: [operationType, target, value, executeData],
    });
};

const getHumanAddressByStringSalt = ({
    beacon,
    humanFactory,
    stringSalt
}) => {
    const salt = ethers.utils.keccak256(ethers.utils.arrayify(ethers.utils.defaultAbiCoder.encode(["string"], [stringSalt])))
    const initCode = ethers.utils.solidityPack(["bytes", "bytes"], [BeaconProxyBytecode, ethers.utils.defaultAbiCoder.encode(["address", "string"], [beacon, ""])])
    const initCodeHash = ethers.utils.keccak256(initCode)
    return ethers.utils.getCreate2Address(humanFactory, salt, initCodeHash)
};

const getHumanSalt = (email, projectId) => ethers.utils.solidityKeccak256(
    ["string", "string"],
    [email, projectId]
);

module.exports = {
    encodeFunctionData,
    getExecuteData,
    getHumanAddressByStringSalt,
    getHumanSalt,
};