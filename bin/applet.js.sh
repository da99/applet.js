#!/usr/bin/env bash
# -*- bash -*-
#
#
orig_args="$@"
action="$1"

if [[ -z "$PORT" ]]; then
  PORT=4560
fi

export PORT="$PORT"
shift


set -u -e -o pipefail


# ==============================================================
# http://www.ibm.com/developerworks/aix/library/au-learningtput/
green=$(tput setaf 2)
green_bg=$(tput setab 2)
white=$(tput setaf 7)
bold_white_on_green=$(tput bold)${white}${green_bg}
bold_white=$(tput bold)${white}
reset_color=$(tput sgr0)
# === Color codes:
# From: http://stackoverflow.com/questions/5947742/how-to-change-the-output-color-of-echo-in-linux
Color_Off='\e[0m'
BRed='\e[1;31m'
Red='\e[0;31m'
Green='\e[0;32m'
Orange='\e[0;33m'

# ==============================================================
start_server () {
  shutdown_server
  (node server.js) &
  server_pid="$!"

  mkdir -p tmp
  echo "$server_pid" > tmp/pid.txt
  echo "=== Started server: $server_pid - $$"
}

shutdown_server () {
  if [[ -f "tmp/pid.txt"  ]]; then
    pid="$(cat tmp/pid.txt)"
    if [[ -n "$pid" ]]; then
      if kill -0 "$pid" 2>/dev/null; then
        echo "=== Shutting server down: $pid - $$ ..."
        kill -SIGINT "$pid"
      fi
    fi
    rm tmp/pid.txt || :
  fi
}



# ===============================================
case "$action" in

  "help")
    echo ""
    echo "  $  watch"
    echo ""
    exit 0
    ;;

  "jshint!")
    js_setup jshint! ./*.js
    ;;

  "watch")

    # === Regular expression:
    IFS=$'\n'
    re='^[0-9]+$'

    ( $0 jshint! && start_server ) || :

    echo "=== Watching..."
    inotifywait --quiet --monitor --event close_write  "./" "$0" | while read CHANGE
    do
      dir=$(echo "$CHANGE" | cut -d' ' -f 1)
      op=$(echo "$CHANGE" | cut -d' ' -f 2)
      path="${dir}$(echo "$CHANGE" | cut -d' ' -f 3)"
      file="$(basename $path)"

      echo -e "=== $CHANGE ($path)"

      if [[ "$path" =~ "$0" ]]; then
        echo "=== Reloading..."
        shutdown_server
        exec "$0" "$orig_args"
      fi

      if [[ "$file" =~ ".js" ]]; then
        js_setup jshint $path

        echo ""

        if [[ "$file" =~ "server.js" ]]; then
          shutdown_server
          start_server
        fi
      fi
    done

    ;;

  *)

    file="$( echo node_modules/*/bin/$action )"

    if [[ -f "$file"  ]]; then
      $file "$@"
      exit 0
    fi

    echo "Unknown action: $action" 1>&2
    exit 1
    ;;

esac # === case $action

