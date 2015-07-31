#!/usr/bin/env bash
# -*- bash -*-
#
#
orig_args="$@"
action="$1"
server_pid=""
shift
set -u -e -o pipefail


# ==============================================================
# http://www.ibm.com/developerworks/aix/library/au-learningtput/
green=$(tput setaf 2)
green_bg=$(tput setb 2)
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
  echo "=== Starting server..."
  (iojs server.js) &
  server_pid="$!"
}

shutdown_server () {
  if [[ ! -z "$server_pid" ]]; then
    echo "=== Shutting server down..."
    kill -SIGINT "$server_pid"
  fi
}

cleanup () {
  echo "=== Sending SIGINT to process group..."
  kill -SIGINT -$$
}
trap cleanup SIGINT SIGTERM

# ===============================================
case "$action" in

  "help")
    echo ""
    echo "  $  watch"
    echo ""
    exit 0
    ;;

  "watch")

    # === Regular expression:
    IFS=$'\n'
    re='^[0-9]+$'

    start_server

    echo "=== Watching..."
    inotifywait --quiet --monitor --event close_write  "./" "$0" | while read CHANGE
    do
      dir=$(echo "$CHANGE" | cut -d' ' -f 1)
      op=$(echo "$CHANGE" | cut -d' ' -f 2)
      file=$(echo "$CHANGE" | cut -d' ' -f 3)
      path="${dir}$file"

      echo -e "=== $CHANGE ($path)"

      if [[ "$path" =~ "$0" ]]; then
        echo "=== Stopping this script."
        shutdown_server
        exec "$0" "$orig_args"
      fi

      if [[ "$file" =~ ".js" ]]; then
        echo -n "=== Running jshint: "
        ( $0 jshint $path && echo -e "${green}Passed${reset_color}" ) || js_failed=""

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



