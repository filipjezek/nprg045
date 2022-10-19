#!/bin/bash

set -ueo pipefail

# params: exit code, program name
usage() {
    echo "Start up flask server for mozaik visualization"
    echo "Usage: $2 [options]"
    echo ""
    echo "Options:"
    echo "   -h, --help"
    echo "      display this message"
    echo "   --prod"
    echo "      use production parameters"
    echo "   --port"
    echo "      port to listen on (default 5000)"
    echo "   --root"
    echo "      root folder for looking up datastores (default .)"
    exit "$1"
}

getopt_options="-o h -l prod,help,port:,root:"
# shellcheck disable=SC2086 # we want option splitting
getopt -Q $getopt_options -- "$@" || usage 1 "$0"
# shellcheck disable=SC2086 # we want option splitting
eval set -- "$( getopt -q $getopt_options -- "$@" )"

declare -x FLASK_APP=backend
declare -x APP_MODE=dev
declare -x FLASK_RUN_PORT=5000
declare -x BACKEND_ROOT="."
roots=()

while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help)
            usage 0 "$0"
            ;;
        --prod)
            APP_MODE=prod
            ;;
        --port)
            FLASK_RUN_PORT="$2"
            shift
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

python3 -m flask run
