while
     qcli help &> /dev/null
     rc=$?; if [[ $rc == 0 ]]; then break; fi
do :;  done

balance=`qcli getbalance`
if [ "${balance:0:1}" == "0" ]
then
    set -x
	qcli generate 600 > /dev/null
	set -
fi

LOCKFILE=${RUNEBASE_DATADIR}/import-test-wallet.lock

if [ ! -e $LOCKFILE ]; then
  while
       qcli getaddressesbyaccount "" &> /dev/null
       rc=$?; if [[ $rc != 0 ]]; then continue; fi

       set -x

       qcli importprivkey "WzxXxpgKjAg2sk4y7ieFB2WkhAgbJ2bS2bpTPFS3xVKcThVkUtGf" # addr=nmLUR7Jsqycqp374TkDAcrErwUydEhcwnc hdkeypath=m/88'/0'/1'
       qcli importprivkey "Wtfa5Wrxm2r9ZTCHjsKfdySzLgCnVFq6KDmjvmumaNYyXAm5fmw6" # addr=npuqCtHQx1FdhNpYCGsfS8pW3GUKqxxpQF hdkeypath=m/88'/0'/2'

       solar --qtum_rpc=$RUNEBASE_RPC prefund nmLUR7Jsqycqp374TkDAcrErwUydEhcwnc 500
       solar --qtum_rpc=$RUNEBASE_RPC prefund npuqCtHQx1FdhNpYCGsfS8pW3GUKqxxpQF 500
       touch $LOCKFILE

       set -
       break
  do :;  done
fi
