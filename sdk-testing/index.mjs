
import 'dotenv/config'
import ethers from 'ethers';
import SDK from '../sdk/index.js';

const PRIV_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const URI = process.env.NEXT_PUBLIC_URI;
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID;


const getProviderMock = (privateKey, rpcUrl) => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const signer = new ethers.Wallet(privateKey).connect(provider)

    return {
        getSigner: () => signer,
    }
}

const initializeSdk = () => {
    const provider = getProviderMock(PRIV_KEY, RPC_URL);
    const sdk = SDK.build({
        uri: URI, 
        accessToken: ACCESS_TOKEN,
        projectId: PROJECT_ID,
        provider,
    });
    console.log('\n>>>>>>\n SDK:', sdk, "\n>>>>>>\n")
    return sdk;
}

const testing = async () => {
    const sdk = initializeSdk();

    const { address, status } = await sdk.getHumanAddress()
    console.log('\n>>>>>>\n HUMAN:', address, status, "\n>>>>>>\n")

    if (status === 'PENDING') {
        const deployedHuman = await sdk.deployHuman({ })
        console.log('\n>>>>>>\n HUMAN DEPLOYED!:', deployedHuman, "\n>>>>>>\n")
    }

    // REQUEST PROPOSAL ALLOWED
    const txContractAllowed = await sdk.updateContractStatus({ contractAddress: '0x2CEDFf179BF88F7B4b1FFF9ca6d53393E956B74F', status: true })
    console.log('\n>>>>>>\n TX CONTRACT ALLOWED:', txContractAllowed, "\n>>>>>>\n")

    const statusContractAllowed = await sdk.checkContractAddress({ contractAddress: '0x2CEDFf179BF88F7B4b1FFF9ca6d53393E956B74F'})
    console.log('\n>>>>>>\n STATUS CONTRACT ALLOWED:', statusContractAllowed, "\n>>>>>>\n")

    const proposal = await sdk.requestProposal({ 
        title: 'Test Proposal',
        description: 'Test Proposal Description',
        calls: [
            {
                "target": "0x2CEDFf179BF88F7B4b1FFF9ca6d53393E956B74F",
                "method": "mint",
                "data": "0x40c10f19000000000000000000000000ef1ce4124292ede43348b5abdc286099fefbea740000000000000000000000000000000000000000000000004563918244f40000",
                "value": "0"
            },
            {
                "target": "0x2CEDFf179BF88F7B4b1FFF9ca6d53393E956B74F",
                "method": "transfer",
                "data": "0xa9059cbb000000000000000000000000e8ccf013e85700b8783fed7ddde63ca608f0954400000000000000000000000000000000000000000000000022b1c8c1227a0000",
                "value": "0"
            }
        ]
    });

    console.log('\n>>>>>>\n PROPOSAL SIGNABLE:', proposal, "\n>>>>>>\n")

    // REQUEST PROPOSAL NOT ALLOWED
    const txContractNotAllowed = await sdk.updateContractStatus({ contractAddress: '0x2CEDFf179BF88F7B4b1FFF9ca6d53393E956B74F', status: false })
    console.log('\n>>>>>>\n TX CONTRACT NOT ALLOWED:', txContractNotAllowed, "\n>>>>>>\n")

    const statusContractNotAllowed = await sdk.checkContractAddress({ contractAddress: '0x2CEDFf179BF88F7B4b1FFF9ca6d53393E956B74F'})
    console.log('\n>>>>>>\n STATUS CONTRACT NOT ALLOWED:', statusContractNotAllowed, "\n>>>>>>\n")

    const proposalConfirm = await sdk.requestProposal({ 
        title: 'Test Proposal With Confirm',
        description: 'Test Proposal Description',
        calls: [
            {
                "target": "0x2CEDFf179BF88F7B4b1FFF9ca6d53393E956B74F",
                "method": "mint",
                "data": "0x40c10f19000000000000000000000000ef1ce4124292ede43348b5abdc286099fefbea740000000000000000000000000000000000000000000000004563918244f40000",
                "value": "0"
            },
            {
                "target": "0x2CEDFf179BF88F7B4b1FFF9ca6d53393E956B74F",
                "method": "transfer",
                "data": "0xa9059cbb000000000000000000000000e8ccf013e85700b8783fed7ddde63ca608f0954400000000000000000000000000000000000000000000000022b1c8c1227a0000",
                "value": "0"
            }
        ]
    });

    console.log('\n>>>>>>\n PROPOSAL PENDING:', proposalConfirm, "\n>>>>>>\n")

    const proposalConfirmed = await sdk.confirmProposal({ proposalId: proposalConfirm._id , code: '123456'})
    console.log('\n>>>>>>\n PROPOSAL CONFIRMED:', proposalConfirmed, "\n>>>>>>\n")

}

testing().catch((e) => {
    console.log('\n>>>>>>\n ERROR:', e, "\n>>>>>>\n")
})