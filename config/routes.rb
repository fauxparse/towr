Towr::Application.routes.draw do
  resources :maps
  
  get ":id" => "maps#show"
end
