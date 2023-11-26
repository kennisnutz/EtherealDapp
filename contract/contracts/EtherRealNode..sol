// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

interface IERC20 {
    function balanceOf(address owner) external view returns (uint);

    function allowance(address owner, address spender) external view returns (uint);

    function transfer(address to, uint value) external returns (bool);

    function transferFrom(address from, address to, uint value) external returns (bool);
}

contract Ethernode is Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _nodeId;
    IERC20 private tokenContract;   
 
    address ZERO_ADDRESS= 0x0000000000000000000000000000000000000000;
    uint256 private refundPercent;
    uint256 private totalClaims;



    enum NodeType {
        PARTICLE,
        CANNON,
        OBTUSE,
        MASTER,
        PARTNER,
        EXECUTIVE,
        FOUNDER
    }

    struct Node {
        uint256 id;
        address owner;
        NodeType nodeType;
        uint256 lastClaim;
        uint256 createdTime;
        bool initialized;
    }

    struct Claim {
        address owner;
        uint256 amount;
        uint256 time;
        uint256 id;

    }


    Node[] private nodes;
    Claim[] private claims;


    mapping(NodeType => uint256) public miningRate;
    mapping(NodeType => uint256) private nodePrice;
    mapping(NodeType => uint256) private nodeEarnings;


    mapping(address => uint256) private userEarnings;
    mapping(address => uint256[]) private nodesOwned;

    mapping(address=>Claim[]) private claimsBy;

 

    event  NodePurchase(address indexed _buyer, NodeType _type,  uint256 _price);
    event RewardClaim(address indexed _claimant, uint256 _amount, uint256 _nodeId);
    event NodeTransfer(uint256 _id, address _sender, address _to, uint256 _time);
    event NodeDeativation(uint256 _id, address _prevOwner, uint256 _time);
    event NodeCreation(address indexed _owner, NodeType _type,  uint256 _time);
    event RefundPercentChange(uint256 _amount, uint256 _time);
    event PriceChange(NodeType _type, uint256 _price, uint256 _time);
    event  RateChange(NodeType _type, uint256 _newRate, uint256 _time);
    event Erc20Withdrawal(address indexed token, uint256 amount, uint256 timestamp);
    event EtherWithdrawal(uint256 amount, uint256 timestamp);


   
    constructor(address _token) {
        tokenContract = IERC20(_token);
        refundPercent=50;
        

        miningRate[NodeType.PARTICLE] = 141203703703;
        miningRate[NodeType.CANNON] = 707175925925;
        miningRate[NodeType.OBTUSE] = 2349537037037;
        miningRate[NodeType.MASTER] = 9365740740740;
        //only owner
        miningRate[NodeType.PARTNER] = 115740740740740;
        miningRate[NodeType.EXECUTIVE] = 694444444444444;
        miningRate[NodeType.FOUNDER] = 1157407407407407;

        nodePrice[NodeType.PARTICLE] = 3 ether;
        nodePrice[NodeType.CANNON] = 10 ether;
        nodePrice[NodeType.OBTUSE] = 30 ether;
        nodePrice[NodeType.MASTER] = 100 ether;
    }


    receive() external payable {}

    //WRITE FUNCTIONS

    //internal functions

    function _claim(uint256 _id) internal returns(bool){
        uint256 claimPeriod= block.timestamp.sub(nodes[_id].lastClaim);
        uint256 amountToClaim= claimPeriod.mul(miningRate[nodes[_id].nodeType]);
        Node storage node=nodes[_id];
        address nodeOwner = node.owner;
        node.lastClaim= block.timestamp;
         Claim memory newClaim= Claim(
            nodeOwner,
            amountToClaim,
            block.timestamp,
            _id
         );
         claimsBy[nodeOwner].push(newClaim);
         claims.push(newClaim);
         
         uint256 totalNodeEarnings= nodeEarnings[nodes[_id].nodeType].add(amountToClaim);
         nodeEarnings[nodes[_id].nodeType]=totalNodeEarnings;

         uint256 totalUserEarnings=userEarnings[nodeOwner].add(amountToClaim);
         userEarnings[nodeOwner]=totalUserEarnings;

         totalClaims=totalClaims.add(amountToClaim);

         require(tokenContract.transfer(nodeOwner, amountToClaim), "Token transfer failed");
         emit RewardClaim(msg.sender, amountToClaim, _id);

        return true;
    }

  

    function _removeNodeFromArray(uint256[] storage arrayData, uint256 element)
        internal returns (uint256[] storage)
    {
        for (uint256 i = 0; i < arrayData.length; i++) {
            if (arrayData[i] == element) {
                arrayData[i] = arrayData[arrayData.length - 1];
                arrayData.pop();
                break;
            }
        }
        return arrayData;
    }

    function _getRefundAmount(uint256 _id) internal view returns(uint256){
        uint256 price= nodePrice[nodes[_id].nodeType];
        return refundPercent.mul(price).div(100);
    }


    




    function buyNode(NodeType nodeType) external returns(bool _status){
        require(tokenContract.balanceOf(msg.sender)>= nodePrice[nodeType], "Insufficient Token Balance");
        require(nodeType < NodeType.PARTNER , "Purchase Access restricted");
       

        tokenContract.transferFrom(msg.sender, address(this), nodePrice[nodeType]);

        Node memory newNode = Node(
            _nodeId.current(),
            msg.sender,
            nodeType,
            block.timestamp,
            block.timestamp,
            true
        );

        nodes.push(newNode);
        nodesOwned[msg.sender].push(newNode.id);
        _nodeId.increment();
        
        emit NodePurchase(msg.sender, nodeType,  nodePrice[nodeType]);
        return true;

   }

   function claimReward(uint256 _id) external returns(bool){
        require(msg.sender== nodes[_id].owner, "Only Node owner can  claim rewards");
        require(block.timestamp > nodes[_id].lastClaim, "Already claimed reward");
        require(nodes[_id].initialized, "Node not active");

        bool success= _claim(_id);
        return success;
    
   }

    function claimAllRewards() external returns(bool){
        require(nodesOwned[msg.sender].length >0, "Must owne at least one Node");
        for(uint256 i=0; i< nodesOwned[msg.sender].length; i++){
            Node memory currentNode=nodes[nodesOwned[msg.sender][i]];
            if(currentNode.initialized && block.timestamp > currentNode.lastClaim){
                _claim(currentNode.id);
            }
        }
        return true;
    }
   



    function transferNode(address _recipient, uint256 _id) external {
        // Check ownership and initialization
        require(nodes[_id].owner == msg.sender, "Node not owned by caller");
        require(address(_recipient)!= address(msg.sender), "Cannot transfer node to self");
        require(address(_recipient)!= address(ZERO_ADDRESS), "Cannot transfer to zero address");
        require(nodes[_id].initialized, "Cannot transfer inactive node");

        // Update ownership and last claim time
        nodes[_id].owner = _recipient;
        nodes[_id].lastClaim = block.timestamp;

        // Update user data
        nodesOwned[msg.sender] = _removeNodeFromArray(nodesOwned[msg.sender], _id);
        nodesOwned[_recipient].push(nodes[_id].id);
        emit NodeTransfer(_id, msg.sender, _recipient, block.timestamp);
    }

    function deactivateNode(uint256 _id) external {
        require(_id < nodes.length, "Node does not exist");
        require(nodes[_id].owner == msg.sender, "Caller is not owner");

        uint256 refundAmount = _getRefundAmount(_id);

        // Set owner to zero address and initialized state to false
        nodes[_id].owner = address(0);
        nodes[_id].initialized = false;

        // Remove the node from the caller's list of owned nodes
        nodesOwned[msg.sender] = _removeNodeFromArray(nodesOwned[msg.sender], _id);

        // Transfer refund amount to the caller
        tokenContract.transfer(msg.sender, refundAmount);
        emit NodeDeativation(_id, msg.sender, block.timestamp);
    }


    //only Owner

    function createNode(NodeType nodeType) external onlyOwner returns(bool _status){
        // require(nodeType <= NodeType.FOUNDER , "No such type");
        Node memory newNode = Node(
            _nodeId.current(),
            msg.sender,
            nodeType,
            block.timestamp,
            block.timestamp,
            true
        );

        nodes.push(newNode);
        nodesOwned[msg.sender].push(newNode.id);
        _nodeId.increment();
        
        emit NodeCreation(msg.sender, nodeType, block.timestamp);
        return true;
    }

     function withdrawERC20(address erc20TokenAddress, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        IERC20 erc20Token = IERC20(erc20TokenAddress);
        require(erc20Token.balanceOf(address(this)) >= amount, "Insufficient balance");   

        address owner =owner();

        // Transfer tokens from the contract to the owner
        erc20Token.transfer(owner, amount);    

        emit Erc20Withdrawal(erc20TokenAddress, amount, block.timestamp);
    }

    function withdrawEther(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient balance");
        address  owner= owner();        
        payable(owner).transfer(amount);
        emit EtherWithdrawal(amount, block.timestamp);
    }

    //setters

    function setRefundPercent(uint256 _amount) external onlyOwner {
        require(_amount < 100, "Cant exceed 100%");
        refundPercent= _amount;
        emit RefundPercentChange(_amount, block.timestamp);
    }

    function setPrice(NodeType _type, uint256 _price) external onlyOwner {
        nodePrice[_type]= _price;
        emit PriceChange(_type, _price, block.timestamp);
    }

    function setMiningRate(NodeType _type, uint256 _rate) external onlyOwner {
        uint256 newRate=  _rate.div(86400);
        miningRate[_type]=newRate;
        emit RateChange(_type, newRate, block.timestamp);
    }


    



   //READ FUNCTIONS

   function getNumberOfNodesOwned(address _owner) public view returns(uint256){
    return nodesOwned[_owner].length;
   }

   function getNumberOfNodes() public view returns(uint256){
    return nodes.length;
   }
   
   function getPrice(NodeType _type) public view returns(uint256){
    return nodePrice[_type];
   }

   function getOwner(uint256 _id) public view returns(address){
    return nodes[_id].owner;
   }

   function getMiningRateByType(NodeType _type)public view returns(uint256){
    return miningRate[_type];
   }

   function getMiningRateById(uint256 _id)public view returns(uint256){
    return miningRate[nodes[_id].nodeType];
   }

   function getLastClaim(uint256 _id)public view returns(uint256){
    return nodes[_id].lastClaim;
   }

   function getPendingReward(uint256 _id) public view returns(uint256){
    uint256 duration= block.timestamp.sub(nodes[_id].lastClaim);
    return miningRate[nodes[_id].nodeType].mul(duration);
   }

   function claimsListBy(address _recipient) public view returns(Claim[] memory){
    return claimsBy[_recipient];
   }

   function claimsList() public view returns(Claim[] memory){
    return claims;
   }

   function getNode(uint256 _id) public view returns(Node memory){
    return nodes[_id];
   }

    function userNodes(address _owner) public view returns (Node[] memory) {
        uint[] memory ownedNodeIndices = nodesOwned[_owner];
        Node[] memory usersNodes = new Node[](ownedNodeIndices.length);

        for (uint i = 0; i < ownedNodeIndices.length; i++) {
            uint nodeIndex = ownedNodeIndices[i];
            usersNodes[i] = nodes[nodeIndex];
        }

        return usersNodes;
    }
   function getRefundPercent() public view returns(uint256){
    return refundPercent;
   }
    
   function getTotalNodeEarnings(NodeType _type) public view returns(uint256){
    return nodeEarnings[_type];
   }

   function getTotalUserEarnings(address _user) public view returns(uint256){
    return userEarnings[_user];
   }

   function getAllNodes() public view returns(Node[] memory){
    return nodes;
   }

   function getAllClaims() public view returns(Claim[] memory){
    return claims;
   }

   function getTotalClaims() public view returns(uint256){
    return totalClaims;
   }

}
