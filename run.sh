#!/bin/bash

set -ueo pipefail

# params: exit code, program name
usage() {
    echo "Start up flask server for mozaik visualization"
    echo "Usage: $2 [options]"
    echo ""
    echo "Options:"
    echo "   --expose"
    echo "      listen on all network interfaces (default false)"
    echo "   -h, --help"
    echo "      display this message"
    echo "   --port"
    echo "      port to listen on (default 5000)"
    echo "   --prod"
    echo "      use production parameters (default false)"
    echo "   --restart"
    echo "      restart on crash (default false)"
    echo "   --root"
    echo "      root folder for looking up datastores, can be specified multiple times (default .)"
    exit "$1"
}

getopt_options="-o h -l expose,help,prod,restart,port:,root:"
# shellcheck disable=SC2086 # we want option splitting
getopt -Q $getopt_options -- "$@" || usage 1 "$0"
# shellcheck disable=SC2086 # we want option splitting
eval set -- "$( getopt -q $getopt_options -- "$@" )"

declare -x FLASK_APP=backend
declare -x APP_MODE=dev
declare -x FLASK_RUN_PORT=5000
declare -x FLASK_RUN_HOST='127.0.0.1'
declare -x BACKEND_ROOT="."
restart=false
roots=()

while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help)
            usage 0 "$0"
            ;;
        --expose)
            FLASK_RUN_HOST='0.0.0.0'
            ;;
        --port)
            FLASK_RUN_PORT="$2"
            shift
            ;;
        --prod)
            APP_MODE=prod
            ;;
        --restart)
            restart=true
            ;;
        --root)
            roots+=("$2")
            shift
            ;;
        --)
            shift
            break
            ;;
        *)
            echo "Unknown option $1" >&2
            exit 1
            ;;
    esac
    shift
done

if [ ${#roots[@]} -gt 0 ]; then
    BACKEND_ROOT="${roots[0]}"
    for r in ${roots[*]:1}; do
        BACKEND_ROOT+=";$r"
    done
fi

if [ "$restart" = true ]; then
    until python3 -m flask run; do
        echo "flask server crashed with exit code $?. Restarting..."
        sleep 1
    done
else
    python3 -m flask run
fi
