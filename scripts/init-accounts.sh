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

       qcli importprivkey "azoAe4hq1zzrWRU5vNiQuVcPXCwmfSgRwpuYnTfUPYD2aW5ukjiK" # addr=5SRQdrJqMuLGVpaimmkWBf5geqmFcWr4QX hdkeypath=m/88'/0'/1'
       qcli importprivkey "axjsxJrtNhNmWyEkviayVVD5npYy32ei3N1nCdDmvj7ezhjKzF3z" # addr=5kNZ95n1BwzDYNjjwwLE6RmNJPX4Q45bGT hdkeypath=m/88'/0'/2'

       solar prefund 5SRQdrJqMuLGVpaimmkWBf5geqmFcWr4QX 500
       solar prefund 5kNZ95n1BwzDYNjjwwLE6RmNJPX4Q45bGT 500
       touch $LOCKFILE

       set -
       break
  do :;  done
fi
