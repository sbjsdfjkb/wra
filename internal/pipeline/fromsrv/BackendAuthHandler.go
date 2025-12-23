package fromsrv

import (
	"log"
	"net/http"
	"strconv"
	"wra/internal/kvstorage"
	"wra/internal/pipeline/base"
	"wra/internal/structs"

	"github.com/google/uuid"
)

type BackendAuthHandler struct {
}

func (h *BackendAuthHandler) HandleFromSrv(req *http.Request, resp *http.Response) base.PipelineResult {
	wraContent, serverCreateData := resp.Header["X-Wra-Data"]
	clientFingerPrint, clientFingerPrintExists := req.Header["X-Wra-Fp"]

	sessionUuid := uuid.New()
	attestUuid := uuid.New()
	headers := map[string]string{}

	headers["X-Wra-Debug"] = strconv.FormatBool(serverCreateData)

	if serverCreateData && clientFingerPrintExists {

		headers["X-Wra-Public"] = sessionUuid.String()
		headers["X-Wra-Private"] = attestUuid.String()

		err := kvstorage.StoreSession(sessionUuid.String(), structs.WraSession{
			Fingerprints: clientFingerPrint[0],
			Data:         wraContent[0],
			Attestation:  attestUuid.String(),
		})
		if err != nil {
			log.Printf("Error storing session in kvstorage: %v", err)
		}
	}

	return base.PipelineResult{Headers: headers}

}
