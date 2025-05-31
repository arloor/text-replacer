podman build . -f Dockerfile -t quay.io/arloor/text-replacer:stock --network host
# podman login quay.io  
podman push quay.io/arloor/text-replacer:stock 
ssh root@tt.arloor.com '
docker stop stock-vite
docker rm stock-vite
docker pull quay.io/arloor/text-replacer:stock
docker run --restart=always --name stock-vite -d -p 127.0.0.1:7780:3000 quay.io/arloor/text-replacer:stock
'