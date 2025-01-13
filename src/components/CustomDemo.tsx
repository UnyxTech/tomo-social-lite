import { useClickWallet, useWalletListWithIsInstall } from '../main'
import { ChainType } from '../state'

export function CustomDemo({ chainType }: { chainType: ChainType }) {
  const walletList = useWalletListWithIsInstall(chainType) || []
  const clickWallet = useClickWallet()
  return (
    <div
      className={
        'tm-flex tm-gap-3 tm-flex-wrap tm-border tm-border-tc1/20 tm-p-4'
      }
    >
      {walletList.map((wallet) => {
        return (
          <div
            key={wallet.id}
            className={
              'tm-flex tm-cursor-pointer tm-flex-col tm-items-center tm-gap-2 tm-p-2 hover:tm-bg-tc1/10'
            }
            onClick={async () => {
              try {
                await clickWallet(wallet)
              } catch (e: any) {
                alert(e?.message || 'Failed')
              }
            }}
          >
            <img
              src={wallet.img}
              alt={wallet.name}
              className={'tm-rounded-lg tm-size-8'}
            />
            <div className={'tm-text-xs tm-text-center'}>
              {wallet.name}
              <br />
              <span className={'tm-text-success'}>
                {wallet.isInstall ? 'install' : ''}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
