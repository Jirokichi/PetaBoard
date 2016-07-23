#Check Parameters
if [ $# -ne 1 ]; then
  echo "指定された引数は$#個です。" 1>&2
  echo "実行するには1個の引数が必要です。" 1>&2
  exit 1
fi


function confirm {
  MSG=$1
  while :
  do  
    echo -n "Is this commit message ok? - '${MSG}' [Y/N]: "
    read ans 
    case $ans in
    [yY]) return 0 ;;
    [nN]) return 1 ;;
    esac
  done
}


echo "Start pusing '$1'"
confirm $1
if [ ${?} == 1 ]; then
    echo "Finish!"
    exit 1
fi

echo "Adding the differences to stage in local repo..."
git add .
git commit -m "$1"
git push -u origin

