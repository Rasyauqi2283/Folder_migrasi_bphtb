package worker

import (
	"context"
	"log"
	"time"

	"ebphtb/backend/internal/repository"
)

// StartPpatSendQueueJob runs a lightweight poller to dispatch due queued sends.
// A queued booking whose scheduled_for date has arrived will be promoted to "Diterima".
func StartPpatSendQueueJob(ppatRepo *repository.PpatRepo) {
	if ppatRepo == nil || ppatRepo.Pool() == nil {
		return
	}
	go func() {
		ticker := time.NewTicker(15 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			ctx, cancel := context.WithTimeout(context.Background(), 25*time.Second)
			n, err := ppatRepo.ProcessDueScheduledSends(ctx, 100)
			cancel()
			if err != nil {
				log.Printf("[PPAT_SEND_QUEUE_JOB] ProcessDueScheduledSends: %v", err)
				continue
			}
			if n > 0 {
				log.Printf("[PPAT_SEND_QUEUE_JOB] dispatched %d queued booking(s)", n)
			}
		}
	}()
}
