package sign

import (
	"crypto/sha512"
	"encoding/hex"
)

func SignCookie(data string, wraAttest string, wraPublic string, timestamp string, id string) string {

	sum := sha512.Sum512([]byte(wraAttest + wraPublic + data + timestamp + id))
	return hex.EncodeToString(sum[:])
}
