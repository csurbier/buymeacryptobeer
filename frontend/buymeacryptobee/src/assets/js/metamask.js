         async function watchNetworks() {
            if (typeof window.ethereum !== 'undefined') {
                console.log('watching network!');
                const accounts = await ethereum.request({method: 'eth_requestAccounts'});
                  // detect Metamask account change
                window.ethereum.on('accountsChanged', (accounts)=> {
                  console.log('accountsChanges',accounts);
                  console.log("===On envoi event connecte")
                  const walletAddress  = accounts[0]
                  $.ajax({
                    url: '/dapp/ajax/connectMetamask/',
                    data: {
                      'walletAddress': walletAddress
                    },
                    dataType: 'json',
                    success: function (data) {
                        let status = data["statusText"]
                        if (status=="OK"){
                            if (data["content"]["wallet_set"]){
                                console.log("watch networks On reload la page")
                                document.location.href="/dapp/claim"
                            }
                        }
                    }
                  });
                });

                // detect Network account change
                window.ethereum.on('chainChanged', (chainId)=>{
                  console.log('chainId',chainId);
                  $.ajax({
                    url: '/dapp/ajax/connectedNetwork/',
                    data: {
                      'connectedNetwork': chainId
                    },
                    dataType: 'json',
                    success: function (data) {
                    }
                  });
                  if (chainId=="0x89" || chainId=="0x13881") {
                  }
                  else{
                        Swal.fire({
                              title: 'Error!',
                              text: 'Please connect your Metamask to Polygon network to use this site',
                              icon: 'error',
                              confirmButtonText: 'OK'
                            })
                  }
                });

            } else {
                console.log("===No metamask")
                Swal.fire({
                              title: 'Error!',
                              text: 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.',
                              icon: 'error',
                              confirmButtonText: 'OK'
                            })
            }
        }

        async function connectMetamask() {
            if (typeof window.ethereum !== 'undefined') {
                console.log('MetaMask is installed!');
                const accounts = await ethereum.request({method: 'eth_requestAccounts'});
                const walletAddress = accounts[0];
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                let message = "Welcome to Exhib.fans"
                let signature = await signer.signMessage(message);
                $.ajax({
                    url: '/dapp/ajax/connectMetamask/',
                    data: {
                        'walletAddress': walletAddress,
                        "signature":signature
                    },
                    dataType: 'json',
                    success: function (data) {
                        let status = data["statusText"]
                        if (status == "OK") {
                            if (data["content"]["wallet_set"]) {
                                console.log("connect metamask On redirect la page")
                                document.location.href="/dapp/claim/"
                            }
                        }
                    }
                });
            } else {
                console.log("===No metamask")
            }
        }
