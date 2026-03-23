package affiliate

type Service struct{}

func NewService() Service {
	return Service{}
}

func (Service) Name() string {
	return "affiliate"
}

