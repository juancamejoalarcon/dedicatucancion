if test -f ./.env.local; then
    export $(cat .env.local | sed 's/#.*//g' | xargs)
else
  if [ -n "$1" ] && [ -n "$2" ]; then
    FTP_USER=$1
    FTP_PASS=$2
  else
    echo "You need to set the credentials, missing FTP_USER or FTP_PASS"
    exit 1
  fi
fi
cp ./dist/soundsonner.js ./dist/soundsonner-admin.js
curl ftp://$FTP_USER:$FTP_PASS@komyunes-cp5017.wordpresstemporal.com/wp-content/plugins/woocommerce/assets/js/admin/soundsonner-admin.js -T ./dist/soundsonner-admin.js
curl ftp://$FTP_USER:$FTP_PASS@komyunes-cp5017.wordpresstemporal.com/wp-content/themes/jupiter-6.2.0/assets/js/soundsonner.js -T ./dist/soundsonner.js