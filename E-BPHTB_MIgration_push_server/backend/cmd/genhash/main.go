// Generate bcrypt hash for password "Farras" (cost 10). Run: go run ./cmd/genhash
package main

import (
	"fmt"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := "Farras"
	if len(os.Args) > 1 {
		password = os.Args[1]
	}
	h, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		fmt.Fprintf(os.Stderr, "bcrypt: %v\n", err)
		os.Exit(1)
	}
	fmt.Print(string(h))
}
