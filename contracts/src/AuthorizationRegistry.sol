// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AuthorizationRegistry
/// @notice Minimal registry to store delegations and verify EIP-712 signed authorizations
contract AuthorizationRegistry {
    struct Delegation {
        address authorizer;
        address delegate;
        bytes32 scope;
        uint256 nonce;
        uint256 expiry;
        bool active;
    }

    mapping(address => mapping(address => Delegation)) private _delegations; // authorizer => delegate => Delegation

    bytes32 public constant EIP712_DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    bytes32 public constant DELEGATION_TYPEHASH = keccak256(
        "Delegation(address authorizer,address delegate,bytes32 scope,uint256 nonce,uint256 expiry)"
    );

    bytes32 public immutable DOMAIN_SEPARATOR;

    constructor(string memory name, string memory version) {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                block.chainid,
                address(this)
            )
        );
    }

    function _hashDelegation(Delegation memory d) internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                DELEGATION_TYPEHASH,
                d.authorizer,
                d.delegate,
                d.scope,
                d.nonce,
                d.expiry
            )
        );
    }

    function _toTypedDataHash(bytes32 structHash) internal view returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
    }

    function addDelegation(
        address authorizer,
        address delegate,
        bytes32 scope,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) external {
        require(delegate != address(0), "bad delegate");
        require(block.timestamp <= expiry, "expired");

        Delegation memory d = Delegation(authorizer, delegate, scope, nonce, expiry, true);
        // enforce monotonic nonce
        Delegation storage existing = _delegations[authorizer][delegate];
        require(nonce > existing.nonce, "nonce not increasing");

        bytes32 digest = _toTypedDataHash(_hashDelegation(d));
        address recovered = _recover(digest, signature);
        require(recovered == authorizer, "bad sig");

        _delegations[authorizer][delegate] = d;
    }

    function revokeDelegation(address delegate) external {
        Delegation storage d = _delegations[msg.sender][delegate];
        require(d.active, "none");
        d.active = false;
    }

    function isDelegationActive(address authorizer, address delegate, bytes32 scope) external view returns (bool) {
        Delegation storage d = _delegations[authorizer][delegate];
        if (!d.active) return false;
        if (d.scope != scope) return false;
        if (block.timestamp > d.expiry) return false;
        return true;
    }

    function verifySignedDelegation(
        address authorizer,
        address delegate,
        bytes32 scope,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) external view returns (bool) {
        Delegation memory d = Delegation(authorizer, delegate, scope, nonce, expiry, true);
        if (block.timestamp > expiry) return false;
        bytes32 digest = _toTypedDataHash(_hashDelegation(d));
        address recovered = _recover(digest, signature);
        return recovered == authorizer;
    }

    function _recover(bytes32 digest, bytes memory signature) internal pure returns (address) {
        if (signature.length != 65) revert("bad sig len");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        if (v < 27) v += 27;
        require(v == 27 || v == 28, "bad v");
        return ecrecover(digest, v, r, s);
    }
}


