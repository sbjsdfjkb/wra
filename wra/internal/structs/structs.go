package structs

type WraSession struct {
	Fingerprints string `json:"fingerprints"`
	Attestation  string `json:"attestation"`
	Data         string `json:"data"`
}
